import cron from "node-cron";
import { pathToFileURL } from "node:url";
import { syncAllUsers } from "./sync.js";
import { prisma } from "./db.js";
import { logger } from "./logger.js";

let started = false;

// Registers the Strava sync cron jobs. Idempotent, so it's safe to call from
// the API server on boot (worker runs in-process) as well as from the
// standalone worker entrypoint below.
export function startWorker(): void {
  if (started) return;
  started = true;

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
}

// Allow running the worker as its own process (e.g. `node dist/worker.js`).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startWorker();
}
