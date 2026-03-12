import cron from "node-cron";
import { syncAllUsers } from "./sync.js";

console.log("[worker] Strava sync worker started");

// Run daily at 3 AM
cron.schedule("0 3 * * *", async () => {
  console.log("[worker] Starting daily Strava sync");
  await syncAllUsers();
  console.log("[worker] Daily sync complete");
});

// Also run once on startup
syncAllUsers().catch(console.error);
