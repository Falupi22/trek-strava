import { prisma } from "./db.js";
import { fetchActivitiesSince } from "./strava.js";
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
  const addedDescent = activities.reduce((s, a) => {
    const range = (a.elev_high ?? 0) - (a.elev_low ?? 0);
    return s + Math.round(Math.max(0, a.total_elevation_gain - range));
  }, 0);

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
