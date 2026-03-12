CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "strava_athlete_id" BIGINT NOT NULL,
    "display_name" TEXT NOT NULL,
    "profile_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_strava_athlete_id_key" ON "users"("strava_athlete_id");

CREATE TABLE "strava_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token_enc" TEXT NOT NULL,
    "refresh_token_enc" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "strava_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "strava_tokens_user_id_key" ON "strava_tokens"("user_id");

CREATE TABLE "strava_summaries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_climb_m" INTEGER NOT NULL DEFAULT 0,
    "total_descent_m" INTEGER NOT NULL DEFAULT 0,
    "activity_count" INTEGER NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMP(3),
    CONSTRAINT "strava_summaries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "strava_summaries_user_id_key" ON "strava_summaries"("user_id");

CREATE TABLE "bikes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "purchase_year" INTEGER,
    "purchase_month" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bikes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bike_components" (
    "id" TEXT NOT NULL,
    "bike_id" TEXT NOT NULL,
    "component_type" TEXT NOT NULL,
    "brand" TEXT,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bike_components_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bike_components_bike_id_component_type_key" ON "bike_components"("bike_id", "component_type");

ALTER TABLE "strava_tokens" ADD CONSTRAINT "strava_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "strava_summaries" ADD CONSTRAINT "strava_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bikes" ADD CONSTRAINT "bikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bike_components" ADD CONSTRAINT "bike_components_bike_id_fkey" FOREIGN KEY ("bike_id") REFERENCES "bikes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
