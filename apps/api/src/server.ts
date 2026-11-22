import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { authRoutes } from "./routes/auth.js";
import { bikeRoutes } from "./routes/bikes.js";
import { stravaRoutes } from "./routes/strava.js";
import { startWorker } from "./worker.js";
import { verifySession } from "./session.js";

// The API sits behind nginx (and possibly a platform load balancer in front of
// that), so the TCP peer is always a proxy. trustProxy makes req.ip the real
// client from X-Forwarded-For — without it every user shares one rate-limit
// bucket. TRUST_PROXY = number of proxy hops in front of the API (default 1:
// just nginx). Set 2 if a platform proxy sits in front of nginx. Don't set it
// higher than the real hop count, or clients can spoof their IP.
function trustProxySetting(): number | boolean | string {
  const v = process.env.TRUST_PROXY ?? "1";
  if (v === "true") return true;
  if (v === "false") return false;
  return /^\d+$/.test(v) ? Number(v) : v; // hop count, or an IP/CIDR list
}

const app = Fastify({
  trustProxy: trustProxySetting(),
  logger: {
    level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  },
});

await app.register(helmet);
// Registered before rate-limit so cookies are parsed when its key is computed.
await app.register(cookie);
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  // Per user, not per IP: riders sharing an IP (club Wi-Fi, mobile carrier
  // NAT) mustn't throttle each other. The session is verified, not just read,
  // so a client can't dodge the limit by sending made-up cookies. Requests
  // without a valid session (landing page, OAuth) fall back to the IP.
  keyGenerator: async (req) => {
    const auth = req.headers.authorization;
    const token =
      req.cookies?.session ?? (auth?.startsWith("Bearer ") ? auth.slice(7) : undefined);
    if (token) {
      try {
        return `user:${(await verifySession(token)).userId}`;
      } catch {
        // invalid/expired: treat as anonymous
      }
    }
    return `ip:${req.ip}`;
  },
});
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:6000",
  credentials: true,
});

await app.register(authRoutes);
await app.register(bikeRoutes);
await app.register(stravaRoutes);

app.get("/health", async () => ({ status: "ok" }));

// Run the Strava sync cron jobs in-process so the worker always runs with the server.
startWorker();

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3000);
await app.listen({ port, host: "::" });
console.log(`API running on port ${port}`);
