import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { syncUser } from "../sync.js";

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
}
