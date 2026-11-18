-- Per-gear ride totals per calendar month, replacing the all-time per-gear
-- totals. Wear can then count only rides since a bike's purchase month or a
-- component's replacement month, and rides recorded on a Strava bike before it
-- was bought can be excluded (and reported to the user).

CREATE TABLE "gear_month_summaries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gear_id" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "total_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_climb_m" INTEGER NOT NULL DEFAULT 0,
    "total_descent_m" INTEGER NOT NULL DEFAULT 0,
    "activity_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "gear_month_summaries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gear_month_summaries_user_id_gear_id_month_key"
    ON "gear_month_summaries"("user_id", "gear_id", "month");

ALTER TABLE "gear_month_summaries" ADD CONSTRAINT "gear_month_summaries_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The old all-time per-gear totals are superseded. Empty them (retention: no
-- data kept that isn't used) but keep the table for this release: the previous
-- API version reads it until the new one takes over, and an empty table is
-- harmless to it. Drop it in a later migration.
DELETE FROM "gear_summaries";

-- Null history_from forces a one-time full rebuild on each user's next sync,
-- which fills the monthly totals. Until then the API falls back to the overall
-- totals (the same behaviour as before per-bike tracking).
UPDATE "strava_summaries" SET "history_from" = NULL;
