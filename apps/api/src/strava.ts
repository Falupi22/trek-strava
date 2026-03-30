import { prisma } from "./db.js";
import { encrypt, decrypt } from "./encryption.js";
import crypto from "crypto";

const STRAVA_BASE = "https://www.strava.com/api/v3";
const TOKEN_URL = "https://www.strava.com/oauth/token";

// Rate limiting: 100 requests per 15 minutes
const requestTimestamps: number[] = [];
const RATE_LIMIT = 100;
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

async function checkRateLimit(): Promise<void> {
  const now = Date.now();
  // Remove old timestamps
  while (
    requestTimestamps.length > 0 &&
    requestTimestamps[0] < now - RATE_WINDOW
  ) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT) {
    const waitTime = RATE_WINDOW - (now - requestTimestamps[0]);
    throw new Error(
      `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
    );
  }
  requestTimestamps.push(now);
}

async function rateLimitedFetch(
  url: string,
  options: RequestInit,
): Promise<Response> {
  await checkRateLimit();
  const res = await fetch(url, options);
  if (res.status === 429) {
    throw new Error("Strava rate limit exceeded. Please try again later.");
  }
  return res;
}

export interface StravaActivity {
  id: number;
  type: string;
  distance: number;
  total_elevation_gain: number;
  elev_low: number;
  elev_high: number;
  start_date: string;
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

  // Refresh
  const res = await rateLimitedFetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: Number(process.env.STRAVA_CLIENT_ID),
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: decrypt(token.refreshTokenEnc),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Token refresh failed");
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
  );
  if (!res.ok) return null;
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
  let page = 1;
  const PARALLEL = 5;

  const fetchPage = (p: number) =>
    rateLimitedFetch(
      `${STRAVA_BASE}/athlete/activities?after=${after}&per_page=200&page=${p}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ).then((r) =>
      r.ok ? (r.json() as Promise<StravaActivity[]>) : Promise.resolve([]),
    );

  while (true) {
    const batches = await Promise.all(
      Array.from({ length: PARALLEL }, (_, i) => fetchPage(page + i)),
    );
    console.log(
      `Fetched pages ${page} to ${page + PARALLEL - 1}, got ${batches.reduce((sum, b) => sum + b.length, 0)} activities`,
    );

    let done = false;
    for (const batch of batches) {
      activities.push(
        ...batch.filter((a) => a.type === "Ride" || a.type === "VirtualRide"),
      );
      if (batch.length < 200) {
        done = true;
        break;
      }
    }

    if (done) break;
    page += PARALLEL;
  }

  return activities;
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
  const callbackUrl = process.env.STRAVA_WEBHOOK_CALLBACK_URL;
  const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN;
  if (!callbackUrl || !verifyToken) {
    throw new Error(
      "STRAVA_WEBHOOK_CALLBACK_URL and STRAVA_WEBHOOK_VERIFY_TOKEN must be set",
    );
  }

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

export function validateWebhookSignature(
  payload: string,
  signature?: string,
): boolean {
  try {
    const secret = process.env.STRAVA_CLIENT_SECRET;
    if (!secret || !signature) return false;

    const expectedSignature = crypto
      .createHmac("sha1", secret)
      .update(payload)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
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
