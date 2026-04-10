import cron from "node-cron";
import { syncAllUsers } from "./sync.js";
import { prisma } from "./db.js";
import { logger } from "./logger.js";

logger.info("[worker] Strava sync worker started");

// Purge stale summaries at 2 AM — any summary not refreshed in 7 days is
// deleted so the next sync rebuilds it from scratch (matches privacy policy).
cron.schedule("0 2 * * *", async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { count } = await prisma.stravaSummary.deleteMany({
    where: { lastSyncedAt: { lt: cutoff } },
  });
  if (count > 0) {
    logger.info({ count }, "[worker] Purged stale Strava summaries");
  }
});

// Run daily at 3 AM
cron.schedule("0 3 * * *", async () => {
  logger.info("[worker] Starting daily Strava sync");
  await syncAllUsers();
  logger.info("[worker] Daily sync complete");
});
