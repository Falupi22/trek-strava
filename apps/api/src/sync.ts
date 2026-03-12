import { prisma } from "./db.js";
import { fetchActivitiesSince } from "./strava.js";

export async function syncUser(userId: string): Promise<void> {
  const existing = await prisma.stravaSummary.findUnique({ where: { userId } });
  const since = existing?.lastSyncedAt ?? new Date("2015-01-01");

  const activities = await fetchActivitiesSince(userId, since);
  if (activities.length === 0) {
    await prisma.stravaSummary.upsert({
      where: { userId },
      create: { userId, lastSyncedAt: new Date() },
      update: { lastSyncedAt: new Date() },
    });
    return;
  }

  const addedKm = activities.reduce((s, a) => s + a.distance / 1000, 0);
  const addedClimb = activities.reduce((s, a) => s + Math.round(a.total_elevation_gain), 0);
  // Descent approximated as elevation gain (Strava list endpoint doesn't return total descent directly)
  const addedDescent = activities.reduce((s, a) => {
    const descent = Math.max(0, a.total_elevation_gain - (a.elev_high - a.elev_low));
    return s + Math.round(descent);
  }, 0);

  await prisma.stravaSummary.upsert({
    where: { userId },
    create: {
      userId,
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
}

export async function syncAllUsers(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { stravaToken: { isNot: null } },
    select: { id: true },
  });
  for (const user of users) {
    try {
      await syncUser(user.id);
      console.log(`[sync] user ${user.id} synced`);
    } catch (e) {
      console.error(`[sync] user ${user.id} failed:`, e);
    }
  }
}
