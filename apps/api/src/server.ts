import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { authRoutes } from "./routes/auth.js";
import { bikeRoutes } from "./routes/bikes.js";
import { stravaRoutes } from "./routes/strava.js";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  },
});

await app.register(helmet);
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:6000",
  credentials: true,
});
await app.register(cookie);

await app.register(authRoutes);
await app.register(bikeRoutes);
await app.register(stravaRoutes);

app.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3000);
await app.listen({ port, host: "::" });
console.log(`API running on port ${port}`);
