import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { authRoutes } from "./routes/auth.js";
import { bikeRoutes } from "./routes/bikes.js";
import { stravaRoutes } from "./routes/strava.js";

const app = Fastify({ logger: process.env.NODE_ENV === "development" });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:6000",
  credentials: true,
});
await app.register(cookie);

// Allow POST requests with Content-Type: application/json (including charset) and keep raw body for webhook signature verification
app.addContentTypeParser(/^application\/(json|.*\+json)/, { parseAs: "string" }, (req, body, done) => {
  (req as any).rawBody = body as string;
  if (!body || body === "") {
    done(null, {});
    return;
  }
  try {
    done(null, JSON.parse(body as string));
  } catch (e) {
    done(e as Error, undefined);
  }
});

await app.register(authRoutes);
await app.register(bikeRoutes);
await app.register(stravaRoutes);

app.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3000);
await app.listen({ port, host: "::" });
console.log(`API running on port ${port}`);
