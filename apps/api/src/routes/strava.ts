import type { FastifyInstance } from "fastify";
import crypto from "crypto";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { syncUser, syncActivityById } from "../sync.js";
import {
  registerWebhook,
  getUserIdFromAthleteId,
  stravaAccessRevoked,
} from "../strava.js";

// Strava does not sign webhook payloads, so the endpoint is authenticated by an
// unguessable secret embedded in the callback path. Constant-time compare so a
// wrong guess can't be narrowed down by timing.
function validWebhookSecret(secret: string | undefined): boolean {
  const expected = process.env.STRAVA_WEBHOOK_SECRET ?? "";
  if (!expected || !secret) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

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

  // Webhook subscription verification (GET). Strava sends this to the callback
  // URL — including the secret path segment — during subscription creation.
  app.get<{ Params: { secret: string } }>(
    "/api/strava/webhook/:secret",
    async (req, reply) => {
      if (!validWebhookSecret(req.params.secret)) {
        return reply.code(404).send(); // don't reveal the path exists
      }
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
    },
  );

  // Webhook events (POST). Authenticated by the secret path segment, since
  // Strava does not sign event payloads.
  app.post<{ Params: { secret: string } }>(
    "/api/strava/webhook/:secret",
    async (req, reply) => {
    if (!validWebhookSecret(req.params.secret)) {
      return reply.code(404).send();
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

      // Strava API compliance: delete user data on deauthorization. Strava
      // signals this as an athlete "update" with updates.authorized === "false"
      // (not a "delete" aspect). Verify the access is genuinely revoked before
      // deleting, so a spoofed/mistaken event can't wipe a live account.
      if (
        event.object_type === "athlete" &&
        String(event.updates?.authorized) === "false"
      ) {
        const userId = await getUserIdFromAthleteId(event.owner_id);
        if (userId && (await stravaAccessRevoked(userId))) {
          await prisma.user.delete({ where: { id: userId } }).catch(
            console.error,
          );
        }
      }
    }

    return { message: "ok" };
  });

  // Register webhook (for admin/testing)
  app.post("/api/strava/webhook/register", { preHandler: requireAuth }, async (req, reply) => {
    try {
      await registerWebhook();
      return { message: "Webhook registered" };
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  });
}
