import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { syncUser, syncActivityById } from "../sync.js";
import {
  registerWebhook,
  getUserIdFromAthleteId,
  validateWebhookSignature,
} from "../strava.js";

export async function stravaRoutes(app: FastifyInstance) {
  app.get(
    "/api/strava/summary",
    { preHandler: requireAuth },
    async (req, reply) => {
      const { userId } = (req as any).session;
      const summary = await prisma.stravaSummary.findUnique({
        where: { userId },
      });
      return {
        totalKm: summary?.totalKm ?? 0,
        totalClimbM: summary?.totalClimbM ?? 0,
        lastSyncedAt: summary?.lastSyncedAt?.toISOString() ?? null,
        synced: !!summary?.lastSyncedAt,
      };
    },
  );

  app.post(
    "/api/strava/sync",
    { preHandler: requireAuth },
    async (req, reply) => {
      const { userId } = (req as any).session;
      syncUser(userId).catch(console.error); // fire and forget
      return { message: "Sync started" };
    },
  );

  // Webhook verification (GET)
  app.get("/api/strava/webhook", async (req, reply) => {
    const query = req.query as any;
    const {
      "hub.mode": mode,
      "hub.challenge": challenge,
      "hub.verify_token": verifyToken,
    } = query;

    if (
      mode === "subscribe" &&
      verifyToken === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
    ) {
      return { "hub.challenge": challenge };
    }

    reply.code(403).send("Forbidden");
  });

  // Webhook events (POST)
  app.post("/api/strava/webhook", async (req, reply) => {
    const signature = (req.headers as any)["x-hub-signature"] as
      | string
      | undefined;
    if (!validateWebhookSignature((req as any).rawBody ?? "", signature)) {
      return reply.code(403).send("Forbidden");
    }

    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      if (event.object_type === "activity" && event.aspect_type === "create") {
        const userId = await getUserIdFromAthleteId(event.owner_id);
        if (userId) {
          syncActivityById(userId, event.object_id).catch(console.error);
        }
      }

      // Strava API compliance: deleted activities must be removed immediately.
      // Since we store aggregated totals (not raw records), we delete the
      // summary and trigger a full resync so the deleted activity is excluded.
      if (event.object_type === "activity" && event.aspect_type === "delete") {
        const userId = await getUserIdFromAthleteId(event.owner_id);
        if (userId) {
          await prisma.stravaSummary
            .delete({ where: { userId } })
            .catch(() => {});
          syncUser(userId).catch(console.error);
        }
      }

      // Strava API compliance: delete user data when they revoke access
      if (event.object_type === "athlete" && event.aspect_type === "delete") {
        const userId = await getUserIdFromAthleteId(event.owner_id);
        if (userId) {
          await prisma.user.delete({ where: { id: userId } }).catch(
            console.error,
          );
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
