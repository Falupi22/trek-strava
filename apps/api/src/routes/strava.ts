import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { syncUser } from "../sync.js";
import { registerWebhook, validateWebhookSignature, getUserIdFromAthleteId } from "../strava.js";

export async function stravaRoutes(app: FastifyInstance) {
  app.get("/api/strava/summary", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).session;
    const summary = await prisma.stravaSummary.findUnique({ where: { userId } });
    return {
      totalKm: summary?.totalKm ?? 0,
      totalClimbM: summary?.totalClimbM ?? 0,
      totalDescentM: summary?.totalDescentM ?? 0,
      lastSyncedAt: summary?.lastSyncedAt?.toISOString() ?? null,
      synced: !!summary?.lastSyncedAt,
    };
  });

  app.post("/api/strava/sync", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).session;
    syncUser(userId).catch(console.error); // fire and forget
    return { message: "Sync started" };
  });

  // Webhook verification (GET)
  app.get("/api/strava/webhook", async (req, reply) => {
    const query = req.query as any;
    const { "hub.mode": mode, "hub.challenge": challenge, "hub.verify_token": verifyToken } = query;

    if (mode === "subscribe" && verifyToken === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
      return { "hub.challenge": challenge };
    }

    reply.code(403).send("Forbidden");
  });

  // Webhook events (POST)
  app.post("/api/strava/webhook", async (req, reply) => {
    const signatureHeaderName =
      Object.keys(req.headers).find((h) =>
        ["x-strava-hmac-sha1", "x-strava-signature"].includes(h.toLowerCase())
      );

    const signature = signatureHeaderName ? (req.headers[signatureHeaderName] as string) : undefined;
    const payload = (req as any).rawBody ?? JSON.stringify(req.body);

    const valid = validateWebhookSignature(payload, signature);
    if (!valid) {
      req.log.warn({ signatureHeaderName, signatureLength: signature?.length ?? 0 }, "Invalid Strava webhook signature");
      reply.code(403).send("Invalid signature");
      return;
    }

    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      if (event.object_type === "activity" && event.aspect_type === "create") {
        const userId = await getUserIdFromAthleteId(event.owner_id);
        if (userId) {
          syncUser(userId).catch(console.error);
        }
      }
    }

    return { message: "ok" };
  });

  // Register webhook (for admin/testing)
  app.post("/api/strava/webhook/register", async (req, reply) => {
    try {
      await registerWebhook();
      return { message: "Webhook registered" };
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  });
}
