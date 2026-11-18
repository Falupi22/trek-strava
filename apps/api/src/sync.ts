import { prisma } from "./db.js";
import {
  fetchActivitiesSince,
  fetchActivity,
  type StravaActivity,
} from "./strava.js";
import { logger } from "./logger.js";
import { inactiveCutoff } from "./retention.js";

// Rides recorded without a bike set in Strava are grouped under this key.
export const NO_GEAR = "none";

interface Totals {
  totalKm: number;
  totalClimbM: number;
  totalDescentM: number;
  activityCount: number;
}

// ── Per-user serialisation ────────────────────────────────────────────
// Every write to a user's totals (incremental sync, full rebuild, single
// webhook activity) runs through one queue per user, so a rebuild can't be
// interleaved with an increment and leave the totals half-old, half-new.
const tails = new Map<string, Promise<unknown>>();

function exclusive<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  const prev = tails.get(userId) ?? Promise.resolve();
  const run = prev.catch(() => {}).then(fn);
  const tail = run.catch(() => {});
  tails.set(userId, tail);
  void tail.then(() => {
    if (tails.get(userId) === tail) tails.delete(userId);
  });
  return run;
}

/** True while any sync/rebuild for the user is queued or running. */
export function syncInProgress(userId: string): boolean {
  return tails.has(userId);
}

// A sync that is queued but hasn't started yet. Further sync requests join it
// instead of queueing another — it hasn't read the user's bikes yet, so it
// will still see whatever changed (e.g. several bikes created in a row).
const pendingSync = new Map<string, Promise<void>>();

export function syncUser(userId: string): Promise<void> {
  const pending = pendingSync.get(userId);
  if (pending) return pending;
  const p = exclusive(userId, async () => {
    pendingSync.delete(userId);
    await _syncUser(userId);
  });
  pendingSync.set(userId, p);
  return p;
}

export function recomputeUser(userId: string): Promise<void> {
  return exclusive(userId, () => _recomputeUser(userId));
}

export function syncActivityById(userId: string, activityId: number): Promise<void> {
  return exclusive(userId, () => _syncActivityById(userId, activityId));
}

// ── Helpers ───────────────────────────────────────────────────────────

// Ride history starts at Jan 1 of the earliest bike's purchase year. Null when
// no bike has a purchase year, in which case there is no history to fetch.
async function historyFloor(userId: string): Promise<Date | null> {
  const bikes = await prisma.bike.findMany({
    where: { userId },
    select: { purchaseYear: true },
  });
  let earliest: number | null = null;
  for (const b of bikes) {
    if (b.purchaseYear == null) continue;
    earliest = earliest === null ? b.purchaseYear : Math.min(earliest, b.purchaseYear);
  }
  return earliest === null ? null : new Date(`${earliest}-01-01`);
}

function emptyTotals(): Totals {
  return { totalKm: 0, totalClimbM: 0, totalDescentM: 0, activityCount: 0 };
}

// One activity's contribution. Strava doesn't provide total_elevation_loss in
// list responses; best approximation is descent ≈ elevation gain (holds for
// loop rides). Used by every sync path so the totals never disagree.
function totalsOf(a: StravaActivity): Totals {
  const climb = Math.round(a.total_elevation_gain);
  return { totalKm: a.distance / 1000, totalClimbM: climb, totalDescentM: climb, activityCount: 1 };
}

function addInto(into: Totals, t: Totals) {
  into.totalKm += t.totalKm;
  into.totalClimbM += t.totalClimbM;
  into.totalDescentM += t.totalDescentM;
  into.activityCount += t.activityCount;
}

// The month an activity belongs to: the 1st of its month (UTC midnight) in the
// rider's LOCAL calendar, so a ride late on the 31st isn't moved to the next
// month by the time zone. Matches how purchase/replacement months are stored.
export function activityMonth(a: Pick<StravaActivity, "start_date" | "start_date_local">): Date {
  const local = a.start_date_local || a.start_date;
  return new Date(`${local.slice(0, 7)}-01T00:00:00Z`);
}

interface Bucket {
  gearId: string;
  month: Date;
  t: Totals;
}

// Sums activities overall and per (gear, month).
function aggregate(activities: StravaActivity[]) {
  const all = emptyTotals();
  const buckets = new Map<string, Bucket>();
  for (const a of activities) {
    const t = totalsOf(a);
    const gearId = a.gear_id || NO_GEAR;
    const month = activityMonth(a);
    const key = `${gearId}|${month.toISOString()}`;
    const b = buckets.get(key) ?? { gearId, month, t: emptyTotals() };
    addInto(all, t);
    addInto(b.t, t);
    buckets.set(key, b);
  }
  return { all, buckets: [...buckets.values()] };
}

function incrementBucket(userId: string, b: Bucket) {
  return prisma.gearMonthSummary.upsert({
    where: { userId_gearId_month: { userId, gearId: b.gearId, month: b.month } },
    create: { userId, gearId: b.gearId, month: b.month, ...b.t },
    update: {
      totalKm: { increment: b.t.totalKm },
      totalClimbM: { increment: b.t.totalClimbM },
      totalDescentM: { increment: b.t.totalDescentM },
      activityCount: { increment: b.t.activityCount },
    },
  });
}

// ── Sync paths ────────────────────────────────────────────────────────

async function _syncUser(userId: string): Promise<void> {
  const [existing, floor] = await Promise.all([
    prisma.stravaSummary.findUnique({ where: { userId } }),
    historyFloor(userId),
  ]);

  if (!floor) {
    // No purchase dates to anchor history to: nothing to fetch yet.
    await prisma.stravaSummary.upsert({
      where: { userId },
      create: { user: { connect: { id: userId } }, lastSyncedAt: new Date() },
      update: { lastSyncedAt: new Date() },
    });
    return;
  }

  // Rebuild from scratch when the stored totals don't cover the full history:
  // first sync, summary purged as stale, totals from before per-bike tracking
  // (historyFrom null), or a bike added/edited with an earlier purchase date.
  if (!existing?.lastSyncedAt || !existing.historyFrom || floor < existing.historyFrom) {
    await _recomputeUser(userId, floor);
    return;
  }

  const activities = await fetchActivitiesSince(userId, existing.lastSyncedAt);
  const { all, buckets } = aggregate(activities);

  await prisma.$transaction([
    prisma.stravaSummary.update({
      where: { userId },
      data: {
        totalKm: { increment: all.totalKm },
        totalClimbM: { increment: all.totalClimbM },
        totalDescentM: { increment: all.totalDescentM },
        activityCount: { increment: all.activityCount },
        lastSyncedAt: new Date(),
      },
    }),
    ...buckets.map((b) => incrementBucket(userId, b)),
  ]);
  logger.info({ userId, ...all }, "[sync] user synced");
}

async function _syncActivityById(userId: string, activityId: number): Promise<void> {
  const activity = await fetchActivity(userId, activityId);
  if (!activity) return;

  const t = totalsOf(activity);
  const bucket: Bucket = {
    gearId: activity.gear_id || NO_GEAR,
    month: activityMonth(activity),
    t,
  };

  await prisma.$transaction([
    prisma.stravaSummary.upsert({
      where: { userId },
      create: { user: { connect: { id: userId } }, ...t, lastSyncedAt: new Date() },
      update: {
        totalKm: { increment: t.totalKm },
        totalClimbM: { increment: t.totalClimbM },
        totalDescentM: { increment: t.totalDescentM },
        activityCount: { increment: 1 },
        lastSyncedAt: new Date(),
      },
    }),
    incrementBucket(userId, bucket),
  ]);
  logger.info({ userId, activityId, gearId: activity.gear_id, ...t }, "[sync] activity synced");
}

// Full authoritative rebuild: fetch every activity from the history floor and
// OVERWRITE the stored totals (overall and per gear). Used for the first sync,
// for delete/edit webhooks (an edit may change distance or the bike used), and
// whenever the history floor moves earlier. We keep no per-activity records, so
// rebuilding is the only way to correct a single activity.
async function _recomputeUser(userId: string, knownFloor?: Date): Promise<void> {
  const floor = knownFloor ?? (await historyFloor(userId)) ?? new Date();
  const activities = await fetchActivitiesSince(userId, floor);
  const { all, buckets } = aggregate(activities);
  const now = new Date();

  await prisma.$transaction([
    prisma.stravaSummary.upsert({
      where: { userId },
      create: {
        user: { connect: { id: userId } },
        ...all,
        lastSyncedAt: now,
        historyFrom: floor,
      },
      update: { ...all, lastSyncedAt: now, historyFrom: floor },
    }),
    prisma.gearMonthSummary.deleteMany({ where: { userId } }),
    prisma.gearMonthSummary.createMany({
      data: buckets.map((b) => ({ userId, gearId: b.gearId, month: b.month, ...b.t })),
    }),
  ]);
  logger.info({ userId, ...all, buckets: buckets.length }, "[sync] user recomputed");
}

// Nightly sync covers active users only. Inactive users' data is left to go
// stale and be purged (see retention.ts); it's rebuilt when they return.
export async function syncCandidates(now = Date.now()): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      stravaToken: { isNot: null },
      lastSeenAt: { gte: inactiveCutoff(now) },
    },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function syncAllUsers(): Promise<void> {
  const users = (await syncCandidates()).map((id) => ({ id }));
  for (const user of users) {
    try {
      await syncUser(user.id);
    } catch (e) {
      logger.error({ userId: user.id, err: e }, "[sync] user sync failed");
    }
  }
}
