import cron from "node-cron";
import { syncAllUsers } from "./sync.js";
import { logger } from "./logger.js";

logger.info("[worker] Strava sync worker started");

// Run daily at 3 AM
cron.schedule("0 3 * * *", async () => {
  logger.info("[worker] Starting daily Strava sync");
  await syncAllUsers();
  logger.info("[worker] Daily sync complete");
});
