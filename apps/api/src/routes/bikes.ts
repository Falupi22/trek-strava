import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { COMPONENT_META, calcWear } from "@bikehealth/shared";

export async function bikeRoutes(app: FastifyInstance) {
  // List bikes
  app.get("/api/bikes", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).session;
    const bikes = await prisma.bike.findMany({ where: { userId } });
    return bikes;
  });

  // Create bike + seed components
  app.post<{
    Body: {
      brand: string;
      model?: string;
      purchaseYear?: number;
      purchaseMonth?: number;
      components?: Record<string, { purchaseDate: string; brand?: string }>;
    };
  }>("/api/bikes", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).session;
    const { brand, model, purchaseYear, purchaseMonth, components } = req.body;

    const bike = await prisma.bike.create({
      data: { userId, brand, model, purchaseYear, purchaseMonth },
    });

    // Seed all 6 components
    const defaultDate = purchaseYear && purchaseMonth
      ? new Date(purchaseYear, purchaseMonth - 1, 1)
      : new Date();

    for (const meta of COMPONENT_META) {
      const override = components?.[meta.id];
      await prisma.bikeComponent.create({
        data: {
          bikeId: bike.id,
          componentType: meta.id,
          brand: override?.brand ?? null,
          purchaseDate: override?.purchaseDate ? new Date(override.purchaseDate) : defaultDate,
        },
      });
    }

    return reply.status(201).send(bike);
  });

  // Delete bike
  app.delete<{ Params: { bikeId: string } }>(
    "/api/bikes/:bikeId",
    { preHandler: requireAuth },
    async (req, reply) => {
      const { userId } = (req as any).session;
      const { bikeId } = req.params;
      const bike = await prisma.bike.findFirst({ where: { id: bikeId, userId } });
      if (!bike) return reply.status(404).send({ error: "Bike not found" });
      await prisma.bike.delete({ where: { id: bikeId } });
      return { success: true };
    }
  );

  // Get components with health scores
  app.get<{ Params: { bikeId: string } }>(
    "/api/bikes/:bikeId/components",
    { preHandler: requireAuth },
    async (req, reply) => {
      const { userId } = (req as any).session;
      const { bikeId } = req.params;

      const bike = await prisma.bike.findFirst({ where: { id: bikeId, userId } });
      if (!bike) return reply.status(404).send({ error: "Bike not found" });

      const [components, summary] = await Promise.all([
        prisma.bikeComponent.findMany({ where: { bikeId } }),
        prisma.stravaSummary.findUnique({ where: { userId } }),
      ]);

      const strava = {
        totalKm: summary?.totalKm ?? 0,
        totalClimbM: summary?.totalClimbM ?? 0,
        totalDescentM: summary?.totalDescentM ?? 0,
        lastSyncedAt: summary?.lastSyncedAt?.toISOString() ?? null,
      };

      const result = components.map((c) => {
        const meta = COMPONENT_META.find((m) => m.id === c.componentType)!;
        const health = calcWear(meta, c.purchaseDate.toISOString().split("T")[0], strava);
        return {
          id: c.id,
          type: c.componentType,
          brand: c.brand,
          purchaseDate: c.purchaseDate.toISOString().split("T")[0],
          ...health,
        };
      });

      return { stravaSummary: strava, components: result };
    }
  );

  // Update a component
  app.patch<{
    Params: { componentId: string };
    Body: { purchaseDate?: string; brand?: string };
  }>("/api/components/:componentId", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).session;
    const { componentId } = req.params;

    // Verify ownership
    const comp = await prisma.bikeComponent.findFirst({
      where: { id: componentId, bike: { userId } },
      include: { bike: true },
    });
    if (!comp) return reply.status(404).send({ error: "Component not found" });

    const updated = await prisma.bikeComponent.update({
      where: { id: componentId },
      data: {
        ...(req.body.purchaseDate && { purchaseDate: new Date(req.body.purchaseDate) }),
        ...(req.body.brand !== undefined && { brand: req.body.brand }),
      },
    });

    const summary = await prisma.stravaSummary.findUnique({ where: { userId } });
    const strava = {
      totalKm: summary?.totalKm ?? 0,
      totalClimbM: summary?.totalClimbM ?? 0,
      totalDescentM: summary?.totalDescentM ?? 0,
      lastSyncedAt: summary?.lastSyncedAt?.toISOString() ?? null,
    };
    const meta = COMPONENT_META.find((m) => m.id === updated.componentType)!;
    const health = calcWear(meta, updated.purchaseDate.toISOString().split("T")[0], strava);

    return { id: updated.id, type: updated.componentType, brand: updated.brand, purchaseDate: updated.purchaseDate.toISOString().split("T")[0], ...health };
  });
}
