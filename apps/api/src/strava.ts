import { prisma } from "./db.js";
import { encrypt, decrypt } from "./encryption.js";

const STRAVA_BASE = "https://www.strava.com/api/v3";
const TOKEN_URL = "https://www.strava.com/oauth/token";

// Rate limiting: Strava's default is 100 requests / 15 min for non-upload (read)
// endpoints — which is all this app uses (/athlete/activities, /activities/:id).
// The daily read cap is 1,000. Raise RATE_LIMIT only if the app is granted a
// documented limit increase.
const requestTimestamps: number[] = [];
const RATE_LIMIT = 100;
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes
// Background jobs (sync, backfill, recompute) wait up to a full window for a
// free slot so they self-pace across windows instead of failing en masse.
// Interactive callers keep the default of 0 to fail fast rather than hang a
// user's request behind the nightly batch.
const BACKGROUND_WAIT_MS = RATE_WINDOW;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Reserves one slot in the rolling window. If the window is full, waits until
// the oldest request ages out (up to maxWaitMs) and then takes the freed slot;
// throws only if no slot frees within that budget. The check-and-push before
// any await is synchronous, so concurrent callers can't over-reserve.
async function checkRateLimit(maxWaitMs: number): Promise<void> {
  const deadline = Date.now() + maxWaitMs;
  for (;;) {
    const now = Date.now();
    while (
      requestTimestamps.length > 0 &&
      requestTimestamps[0] < now - RATE_WINDOW
    ) {
      requestTimestamps.shift();
    }
    if (requestTimestamps.length < RATE_LIMIT) {
      requestTimestamps.push(now);
      return;
    }
    // Window full: the oldest request ages out after this delay, freeing a slot.
    const waitTime = requestTimestamps[0] + RATE_WINDOW - now;
    if (now + waitTime > deadline) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
      );
    }
    await sleep(waitTime + 50);
  }
}

async function rateLimitedFetch(
  url: string,
  options: RequestInit,
  maxWaitMs = 0,
): Promise<Response> {
  await checkRateLimit(maxWaitMs);
  const res = await fetch(url, options);
  if (res.status === 429) {
    throw new Error("Strava rate limit exceeded. Please try again later.");
  }
  return res;
}

// A non-OK Strava response. Thrown instead of treating the failure as "no
// data": callers write totals only after a fully successful fetch, so a
// 401/403/5xx can never zero or truncate a user's stored totals.
export class StravaApiError extends Error {
  constructor(
    public readonly status: number,
    what: string,
  ) {
    super(`Strava ${what} failed: HTTP ${status}`);
    this.name = "StravaApiError";
  }
}

export interface StravaActivity {
  id: number;
  type: string;
  distance: number;
  total_elevation_gain: number;
  elev_low: number;
  elev_high: number;
  start_date: string;
  /** Start time in the rider's local time zone (ISO, no offset applied). */
  start_date_local?: string;
  /** Strava gear (bike) the ride was recorded on; null when none was set. */
  gear_id: string | null;
}

export interface StravaBike {
  id: string;
  name: string;
  primary: boolean;
  retired: boolean;
}

export async function exchangeCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  athlete: { id: number; firstname: string; lastname: string; profile: string };
}> {
  const res = await rateLimitedFetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: Number(process.env.STRAVA_CLIENT_ID),
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange failed: ${res.status}`);
  const data = (await res.json()) as any;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(data.expires_at * 1000),
    athlete: data.athlete,
  };
}

async function getValidAccessToken(userId: string): Promise<string> {
  const token = await prisma.stravaToken.findUnique({ where: { userId } });
  if (!token) throw new Error("No Strava token found");

  const now = new Date();
  const expiresAt = new Date(token.expiresAt);

  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return decrypt(token.accessTokenEnc);
  }

  // Refresh. Only reached from the background read paths (fetchActivity /
  // fetchActivitiesSince), so wait for a rate-limit slot rather than fail fast.
  const res = await rateLimitedFetch(
    TOKEN_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: Number(process.env.STRAVA_CLIENT_ID),
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: decrypt(token.refreshTokenEnc),
        grant_type: "refresh_token",
      }),
    },
    BACKGROUND_WAIT_MS,
  );
  if (!res.ok) throw new StravaApiError(res.status, "token refresh");
  const data = (await res.json()) as any;

  await prisma.stravaToken.update({
    where: { userId },
    data: {
      accessTokenEnc: encrypt(data.access_token),
      refreshTokenEnc: encrypt(data.refresh_token),
      expiresAt: new Date(data.expires_at * 1000),
    },
  });

  return data.access_token;
}

export async function fetchActivity(
  userId: string,
  activityId: number,
): Promise<StravaActivity | null> {
  const token = await getValidAccessToken(userId);
  const res = await rateLimitedFetch(
    `${STRAVA_BASE}/activities/${activityId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
    BACKGROUND_WAIT_MS,
  );
  // Gone (deleted, or made private) since the webhook fired: nothing to add.
  if (res.status === 404) return null;
  if (!res.ok) throw new StravaApiError(res.status, `activity ${activityId} fetch`);
  const a = (await res.json()) as StravaActivity;
  if (a.type !== "Ride" && a.type !== "VirtualRide") return null;
  return a;
}

export async function fetchActivitiesSince(
  userId: string,
  since: Date,
): Promise<StravaActivity[]> {
  const token = await getValidAccessToken(userId);
  const after = Math.floor(since.getTime() / 1000);
  const activities: StravaActivity[] = [];

  // Sequential pagination: fetch one page at a time and stop as soon as a page
  // comes back short (< 200), i.e. the last page. This costs exactly
  // ceil(activities / 200) requests — a single request for accounts with under
  // 200 rides — instead of always firing 5 parallel pages regardless of size.
  const PER_PAGE = 200;
  let page = 1;
  while (true) {
    const res = await rateLimitedFetch(
      `${STRAVA_BASE}/athlete/activities?after=${after}&per_page=${PER_PAGE}&page=${page}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      BACKGROUND_WAIT_MS,
    );
    // Any failure aborts the whole fetch (even mid-pagination), so callers
    // never aggregate a partial history.
    if (!res.ok) throw new StravaApiError(res.status, `activities page ${page} fetch`);
    const batch = (await res.json()) as StravaActivity[];
    activities.push(
      ...batch.filter((a) => a.type === "Ride" || a.type === "VirtualRide"),
    );
    if (batch.length < PER_PAGE) break; // short page = last page
    page += 1;
  }

  return activities;
}

// The athlete's bikes as configured in Strava. The bike list is only part of
// the detailed athlete, which needs the profile:read_all scope — users who
// connected before that scope was requested get null and must reconnect.
// Interactive (setup / edit screens), so it fails fast on rate limiting.
export async function fetchAthleteBikes(
  userId: string,
): Promise<StravaBike[] | null> {
  const token = await getValidAccessToken(userId);
  const res = await rateLimitedFetch(`${STRAVA_BASE}/athlete`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new StravaApiError(res.status, "athlete fetch");
  const data = (await res.json()) as any;
  if (!Array.isArray(data.bikes)) return null;
  return data.bikes.map((b: any) => ({
    id: String(b.id),
    name: String(b.name ?? b.nickname ?? "Unnamed bike"),
    primary: !!b.primary,
    retired: !!b.retired,
  }));
}

export async function revokeToken(userId: string): Promise<void> {
  const token = await prisma.stravaToken.findUnique({ where: { userId } });
  if (!token) return;
  const accessToken = decrypt(token.accessTokenEnc);
  await fetch("https://www.strava.com/oauth/deauthorize", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => {}); // best-effort
}

// Webhook functions
export async function registerWebhook(): Promise<void> {
  const baseUrl = process.env.STRAVA_WEBHOOK_CALLBACK_URL;
  const secret = process.env.STRAVA_WEBHOOK_SECRET;
  const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN;
  if (!baseUrl || !secret || !verifyToken) {
    throw new Error(
      "STRAVA_WEBHOOK_CALLBACK_URL, STRAVA_WEBHOOK_SECRET and STRAVA_WEBHOOK_VERIFY_TOKEN must be set",
    );
  }
  // The secret is the endpoint's authenticator, so it lives in the callback path.
  const callbackUrl = `${baseUrl.replace(/\/$/, "")}/${secret}`;

  const res = await fetch("https://www.strava.com/api/v3/push_subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: Number(process.env.STRAVA_CLIENT_ID),
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      callback_url: callbackUrl,
      verify_token: verifyToken,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Webhook registration failed: ${res.status} ${error}`);
  }

  const data = await res.json();
  console.log("Webhook registered:", data);
}

export async function getUserIdFromAthleteId(
  athleteId: number,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { stravaAthleteId: BigInt(athleteId) },
    select: { id: true },
  });
  return user?.id ?? null;
}

// Confirms with Strava that a user's access is actually revoked, used before
// acting on a deauthorization webhook so a spoofed/mistaken event can't delete
// a live account. The refresh token is the durable credential — if the athlete
// deauthorized, a refresh fails with invalid_grant (400/401). We only report
// "revoked" on a definitive signal; ambiguous errors (network/5xx) return false
// so we never delete on uncertainty.
export async function stravaAccessRevoked(userId: string): Promise<boolean> {
  const token = await prisma.stravaToken.findUnique({ where: { userId } });
  if (!token) return true; // no credential on file = effectively gone

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: Number(process.env.STRAVA_CLIENT_ID),
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: decrypt(token.refreshTokenEnc),
      grant_type: "refresh_token",
    }),
  }).catch(() => null);

  if (!res) return false; // network error — indeterminate, don't delete
  if (res.ok) return false; // refresh succeeded — access is intact
  return res.status === 400 || res.status === 401; // invalid_grant — truly revoked
}
