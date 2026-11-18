-- Multiple bikes per user, each linked to a Strava gear, with per-gear totals.

ALTER TABLE "bikes" ADD COLUMN "strava_gear_id" TEXT;
ALTER TABLE "bikes" ADD COLUMN "strava_gear_name" TEXT;
ALTER TABLE "bikes" ADD COLUMN "is_default" BOOLEAN NOT NULL DEFAULT false;

-- Existing users have one bike; make each user's oldest bike the default.
UPDATE "bikes" SET "is_default" = true
WHERE "id" IN (
    SELECT DISTINCT ON ("user_id") "id" FROM "bikes" ORDER BY "user_id", "created_at"
);

CREATE UNIQUE INDEX "bikes_user_id_strava_gear_id_key" ON "bikes"("user_id", "strava_gear_id");

-- Null history_from forces a one-time full rebuild on the next sync, which
-- backfills the per-gear totals for existing users.
ALTER TABLE "strava_summaries" ADD COLUMN "history_from" TIMESTAMP(3);

CREATE TABLE "gear_summaries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gear_id" TEXT NOT NULL,
    "total_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_climb_m" INTEGER NOT NULL DEFAULT 0,
    "total_descent_m" INTEGER NOT NULL DEFAULT 0,
    "activity_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "gear_summaries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gear_summaries_user_id_gear_id_key" ON "gear_summaries"("user_id", "gear_id");

ALTER TABLE "gear_summaries" ADD CONSTRAINT "gear_summaries_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
