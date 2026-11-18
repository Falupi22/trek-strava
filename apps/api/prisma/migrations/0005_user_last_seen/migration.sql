-- Track each user's last visit so inactive users stop being synced and their
-- Strava data is purged (Strava API Policy §6.4: retain data only as long as
-- necessary for its purpose). Existing users start "seen now", which gives
-- them the full inactivity window from this deploy.
ALTER TABLE "users" ADD COLUMN "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "users_last_seen_at_idx" ON "users"("last_seen_at");
