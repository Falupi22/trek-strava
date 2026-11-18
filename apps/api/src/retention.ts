import { prisma } from "./db.js";

// Data-retention policy (Strava API Policy §6.2/§6.4, GDPR storage limitation).
// Must match what the privacy policy tells users.
//
// - Active users (seen within INACTIVE_AFTER_DAYS) are synced normally.
// - Inactive users are no longer synced and webhook events for them are
//   ignored. Their Strava-derived totals then go stale and the nightly purge
//   (SUMMARY_MAX_AGE_DAYS) deletes them; their Strava name/photo is cleared at
//   the same point.
// - The account, bikes and components the user entered are kept until they
//   disconnect. On return, the Strava data is rebuilt automatically.

const DAY_MS = 24 * 60 * 60 * 1000;

export const INACTIVE_AFTER_DAYS = 30;
export const SUMMARY_MAX_AGE_DAYS = 7;

// Don't write lastSeenAt on every request; once an hour is plenty.
export const LAST_SEEN_WRITE_INTERVAL_MS = 60 * 60 * 1000;

export function daysAgo(days: number, now = Date.now()): Date {
  return new Date(now - days * DAY_MS);
}

export function inactiveCutoff(now = Date.now()): Date {
  return daysAgo(INACTIVE_AFTER_DAYS, now);
}

export async function isActiveUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastSeenAt: true },
  });
  return !!user && user.lastSeenAt >= inactiveCutoff();
}
