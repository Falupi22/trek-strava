import cron from "node-cron";
import { pathToFileURL } from "node:url";
import { syncAllUsers } from "./sync.js";
import { prisma } from "./db.js";
import { logger } from "./logger.js";
import {
  INACTIVE_AFTER_DAYS,
  SUMMARY_MAX_AGE_DAYS,
  daysAgo,
} from "./retention.js";

let started = false;

// Nightly retention cleanup (2 AM). Exported so it can be tested directly.
export async function purgeStaleData(
  now = Date.now(),
): Promise<{ summaries: number; profiles: number }> {
  // Any summary not refreshed in 7 days is deleted, so the next sync rebuilds
  // it from scratch (matches privacy policy). Inactive users aren't synced, so
  // this is also what deletes their totals.
  const stale = await prisma.stravaSummary.findMany({
    where: { lastSyncedAt: { lt: daysAgo(SUMMARY_MAX_AGE_DAYS, now) } },
    select: { userId: true },
  });
  const userIds = stale.map((s) => s.userId);
  // Per-bike monthly totals go with the overall summary. The legacy all-time
  // table is emptied outright: nothing reads it any more, but the previous API
  // version could have written to it during a deploy's rollover.
  const [, , { count: summaries }] = await prisma.$transaction([
    prisma.gearSummary.deleteMany({}),
    prisma.gearMonthSummary.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.stravaSummary.deleteMany({ where: { userId: { in: userIds } } }),
  ]);
  if (summaries > 0) {
    logger.info({ count: summaries }, "[worker] Purged stale Strava summaries");
  }

  // Strava profile data (name, photo) of inactive users goes at the same
  // point as their totals. Restored from Strava when they reconnect. The
  // athlete id is kept: it's how a returning user is matched to their account.
  const { count: profiles } = await prisma.user.updateMany({
    where: {
      lastSeenAt: { lt: daysAgo(INACTIVE_AFTER_DAYS + SUMMARY_MAX_AGE_DAYS, now) },
      OR: [{ displayName: { not: "" } }, { profileImageUrl: { not: null } }],
    },
    data: { displayName: "", profileImageUrl: null },
  });
  if (profiles > 0) {
    logger.info({ count: profiles }, "[worker] Cleared profile data of inactive users");
  }
  return { summaries, profiles };
}

// Registers the Strava sync cron jobs. Idempotent, so it's safe to call from
// the API server on boot (worker runs in-process) as well as from the
// standalone worker entrypoint below.
export function startWorker(): void {
  if (started) return;
  started = true;

  logger.info("[worker] Strava sync worker started");

  cron.schedule("0 2 * * *", async () => {
    try {
      await purgeStaleData();
    } catch (err) {
      logger.error({ err }, "[worker] Purge failed");
    }
  });

  // Run daily at 3 AM
  cron.schedule("0 3 * * *", async () => {
    logger.info("[worker] Starting daily Strava sync");
    await syncAllUsers();
    logger.info("[worker] Daily sync complete");
  });
}

// Allow running the worker as its own process (e.g. `node dist/worker.js`).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startWorker();
}
