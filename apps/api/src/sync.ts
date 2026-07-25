import { prisma } from "./db.js";
import { fetchActivitiesSince, fetchActivity } from "./strava.js";
import { logger } from "./logger.js";

const syncing = new Map<string, Promise<void>>();

export async function syncUser(userId: string): Promise<void> {
  if (syncing.has(userId)) return syncing.get(userId)!;
  const promise = _syncUser(userId).finally(() => syncing.delete(userId));
  syncing.set(userId, promise);
  return promise;
}

async function _syncUser(userId: string): Promise<void> {
  const [existing, bikes] = await Promise.all([
    prisma.stravaSummary.findUnique({ where: { userId } }),
    prisma.bike.findMany({ where: { userId }, select: { purchaseYear: true } }),
  ]);

  const earliestYear = bikes.reduce<number | null>((min, b) => {
    if (b.purchaseYear == null) return min;
    return min === null ? b.purchaseYear : Math.min(min, b.purchaseYear);
  }, null);

  const fallback = earliestYear
    ? new Date(`${earliestYear}-01-01`)
    : new Date();
  const since = existing?.lastSyncedAt ?? fallback;

  const activities = await fetchActivitiesSince(userId, since);
  if (activities.length === 0) {
    await prisma.stravaSummary.upsert({
      where: { userId },
      create: { user: { connect: { id: userId } }, lastSyncedAt: new Date() },
      update: { lastSyncedAt: new Date() },
    });
    return;
  }

  const addedKm = activities.reduce((s, a) => s + a.distance / 1000, 0);
  const addedClimb = activities.reduce((s, a) => s + Math.round(a.total_elevation_gain), 0);
  // Strava doesn't provide total_elevation_loss in list responses.
  // Best approximation: descent ≈ elevation gain (holds for loop rides).
  const addedDescent = activities.reduce((s, a) => s + Math.round(a.total_elevation_gain), 0);

  await prisma.stravaSummary.upsert({
    where: { userId },
    create: {
      user: { connect: { id: userId } },
      totalKm: addedKm,
      totalClimbM: addedClimb,
      totalDescentM: addedDescent,
      activityCount: activities.length,
      lastSyncedAt: new Date(),
    },
    update: {
      totalKm: { increment: addedKm },
      totalClimbM: { increment: addedClimb },
      totalDescentM: { increment: addedDescent },
      activityCount: { increment: activities.length },
      lastSyncedAt: new Date(),
    },
  });
  logger.info({ userId, addedKm, addedClimb, addedDescent, count: activities.length }, "[sync] user synced");
}

export async function syncActivityById(userId: string, activityId: number): Promise<void> {
  const activity = await fetchActivity(userId, activityId);
  if (!activity) return;

  const addedKm = activity.distance / 1000;
  const addedClimb = Math.round(activity.total_elevation_gain);
  const range = (activity.elev_high ?? 0) - (activity.elev_low ?? 0);
  const addedDescent = Math.round(Math.max(0, activity.total_elevation_gain - range));

  await prisma.stravaSummary.upsert({
    where: { userId },
    create: {
      user: { connect: { id: userId } },
      totalKm: addedKm,
      totalClimbM: addedClimb,
      totalDescentM: addedDescent,
      activityCount: 1,
      lastSyncedAt: new Date(),
    },
    update: {
      totalKm: { increment: addedKm },
      totalClimbM: { increment: addedClimb },
      totalDescentM: { increment: addedDescent },
      activityCount: { increment: 1 },
      lastSyncedAt: new Date(),
    },
  });
  logger.info({ userId, activityId, addedKm, addedClimb, addedDescent }, "[sync] activity synced");
}

// Full authoritative recompute: fetch every activity from the start and
// OVERWRITE the stored totals (not increment). Used for delete/edit webhooks,
// where the correct total can only be obtained by rebuilding from Strava's
// current set of activities — since we keep no per-activity records to subtract
// or adjust a single one.
export async function recomputeUser(userId: string): Promise<void> {
  const bikes = await prisma.bike.findMany({
    where: { userId },
    select: { purchaseYear: true },
  });
  let earliestYear: number | null = null;
  for (const b of bikes) {
    if (b.purchaseYear == null) continue;
    earliestYear =
      earliestYear === null ? b.purchaseYear : Math.min(earliestYear, b.purchaseYear);
  }

  // Floor at the earliest bike year, else epoch, so we always pull full history.
  const since = earliestYear ? new Date(`${earliestYear}-01-01`) : new Date(0);
  const activities = await fetchActivitiesSince(userId, since);

  const totalKm = activities.reduce((s, a) => s + a.distance / 1000, 0);
  const totalClimb = activities.reduce((s, a) => s + Math.round(a.total_elevation_gain), 0);
  // Strava doesn't provide total_elevation_loss in list responses.
  // Best approximation: descent ≈ elevation gain (holds for loop rides).
  const totalDescent = totalClimb;

  await prisma.stravaSummary.upsert({
    where: { userId },
    create: {
      user: { connect: { id: userId } },
      totalKm,
      totalClimbM: totalClimb,
      totalDescentM: totalDescent,
      activityCount: activities.length,
      lastSyncedAt: new Date(),
    },
    update: {
      totalKm,
      totalClimbM: totalClimb,
      totalDescentM: totalDescent,
      activityCount: activities.length,
      lastSyncedAt: new Date(),
    },
  });
  logger.info({ userId, totalKm, totalClimb, count: activities.length }, "[sync] user recomputed");
}

export async function syncAllUsers(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { stravaToken: { isNot: null } },
    select: { id: true },
  });
  for (const user of users) {
    try {
      await syncUser(user.id);
    } catch (e) {
      logger.error({ userId: user.id, err: e }, "[sync] user sync failed");
    }
  }
}
