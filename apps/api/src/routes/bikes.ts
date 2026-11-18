import type { FastifyInstance } from "fastify";
import type { Bike, BikeComponent } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { COMPONENT_META, calcWear, getHealthLabel } from "@bikehealth/shared";
import { syncUser } from "../sync.js";
import { loadRideStats, type RideTotals } from "../bikeStats.js";

interface BikeBody {
  brand?: string;
  model?: string | null;
  purchaseYear?: number | null;
  purchaseMonth?: number | null;
  stravaGearId?: string | null;
  stravaGearName?: string | null;
  isDefault?: boolean;
}

const isoDate = (d: Date) => d.toISOString().split("T")[0];

// Components start out dated to the bike's purchase (1st of the month).
function bikeStartDate(year?: number | null, month?: number | null): Date {
  return year && month ? new Date(Date.UTC(year, month - 1, 1)) : new Date();
}

function wearInput(t: RideTotals, lastSyncedAt: string | null) {
  return {
    totalKm: t.totalKm,
    totalClimbM: t.totalClimbM,
    totalDescentM: t.totalDescentM,
    lastSyncedAt,
  };
}

function componentHealth(
  c: BikeComponent,
  strava: ReturnType<typeof wearInput>,
) {
  const meta = COMPONENT_META.find((m) => m.id === c.componentType)!;
  return {
    id: c.id,
    type: c.componentType,
    brand: c.brand,
    purchaseDate: isoDate(c.purchaseDate),
    ...calcWear(meta, isoDate(c.purchaseDate), strava),
  };
}

function bikeDto(b: Bike) {
  return {
    id: b.id,
    brand: b.brand,
    model: b.model,
    purchaseYear: b.purchaseYear,
    purchaseMonth: b.purchaseMonth,
    stravaGearId: b.stravaGearId,
    stravaGearName: b.stravaGearName,
    isDefault: b.isDefault,
  };
}

// True unless year/month (1-12) is after the current month. One day of slack,
// so a user east of UTC on the 1st of a new month (still the previous month in
// UTC) isn't rejected.
function notFuture(year: number, month: number): boolean {
  const limit = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const ly = limit.getUTCFullYear();
  return year < ly || (year === ly && month <= limit.getUTCMonth() + 1);
}

// Parses a component date ("YYYY-MM-DD"). Null if malformed, implausibly old,
// or in the future — so bad input is a 400, not a 500 from an Invalid Date.
function parseComponentDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  if (y < 1990 || !notFuture(y, d.getUTCMonth() + 1)) return null;
  return d;
}

// Validates the editable bike fields. Returns an error message, or null.
function validate(body: BikeBody, creating: boolean): string | null {
  if (creating || body.brand !== undefined) {
    if (typeof body.brand !== "string" || !body.brand.trim() || body.brand.length > 60)
      return "Brand is required";
  }
  if (body.model != null && (typeof body.model !== "string" || body.model.length > 80))
    return "Invalid model";
  const year = new Date().getFullYear();
  if (body.purchaseYear != null && (!Number.isInteger(body.purchaseYear) || body.purchaseYear < 1990 || body.purchaseYear > year))
    return "Invalid purchase year";
  if (body.purchaseMonth != null && (!Number.isInteger(body.purchaseMonth) || body.purchaseMonth < 1 || body.purchaseMonth > 12))
    return "Invalid purchase month";
  if (body.purchaseYear != null && body.purchaseMonth != null && !notFuture(body.purchaseYear, body.purchaseMonth))
    return "Purchase date can't be in the future";
  if (body.stravaGearId != null && (typeof body.stravaGearId !== "string" || !/^[a-z]?\d{1,20}$/i.test(body.stravaGearId)))
    return "Invalid Strava bike";
  if (body.stravaGearName != null && (typeof body.stravaGearName !== "string" || body.stravaGearName.length > 100))
    return "Invalid Strava bike name";
  return null;
}

// A Strava bike can back only one tracked bike, or its rides would count twice.
async function gearTaken(userId: string, gearId: string | null | undefined, exceptBikeId?: string) {
  if (!gearId) return false;
  const other = await prisma.bike.findFirst({
    where: { userId, stravaGearId: gearId, ...(exceptBikeId && { id: { not: exceptBikeId } }) },
    select: { id: true },
  });
  return !!other;
}

export async function bikeRoutes(app: FastifyInstance) {
  // List bikes, each with its ride totals and a component health tally, plus
  // the totals across all bikes.
  app.get("/api/bikes", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).session;
    const bikes = await prisma.bike.findMany({
      where: { userId },
      include: { components: true },
      orderBy: { createdAt: "asc" },
    });
    const stats = await loadRideStats(userId, bikes);

    return bikes.map((b) => {
      const rides = stats.perBike.get(b.id)!;
      const strava = wearInput(rides, stats.lastSyncedAt);
      const tally = { Good: 0, Fair: 0, Replace: 0 };
      for (const c of b.components) {
        tally[getHealthLabel(componentHealth(c, strava).healthPercent)]++;
      }
      return { ...bikeDto(b), stats: rides, health: tally };
    });
  });

  // Create bike + seed components
  app.post<{
    Body: BikeBody & {
      components?: Record<string, { purchaseDate: string; brand?: string }>;
    };
  }>("/api/bikes", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).session;
    const body = req.body ?? {};
    const error = validate(body, true);
    if (error) return reply.status(400).send({ error });
    if (await gearTaken(userId, body.stravaGearId)) {
      return reply.status(409).send({ error: "That Strava bike is already linked to another bike" });
    }
    const overrides: Record<string, { date: Date; brand: string | null }> = {};
    for (const [type, o] of Object.entries(body.components ?? {})) {
      if (!COMPONENT_META.some((m) => m.id === type)) continue; // unknown types are ignored, as before
      const date = parseComponentDate(o?.purchaseDate);
      if (!date) return reply.status(400).send({ error: "Invalid component date" });
      overrides[type] = { date, brand: typeof o.brand === "string" ? o.brand.slice(0, 80) : null };
    }

    const hasDefault = await prisma.bike.count({ where: { userId, isDefault: true } });
    const makeDefault = !!body.isDefault || hasDefault === 0;
    const defaultDate = bikeStartDate(body.purchaseYear, body.purchaseMonth);

    const bike = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.bike.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return tx.bike.create({
        data: {
          userId,
          brand: body.brand!.trim(),
          model: body.model?.trim() || null,
          purchaseYear: body.purchaseYear ?? null,
          purchaseMonth: body.purchaseMonth ?? null,
          stravaGearId: body.stravaGearId || null,
          stravaGearName: body.stravaGearId ? body.stravaGearName?.trim() || null : null,
          isDefault: makeDefault,
          components: {
            create: COMPONENT_META.map((meta) => {
              const override = overrides[meta.id];
              return {
                componentType: meta.id,
                brand: override?.brand ?? null,
                purchaseDate: override?.date ?? defaultDate,
              };
            }),
          },
        },
      });
    });

    // A bike with an earlier purchase date extends the ride history; the sync
    // detects that and rebuilds. Requests made in a burst coalesce into one.
    syncUser(userId).catch(console.error);

    return reply.status(201).send(bikeDto(bike));
  });

  // Edit bike details / Strava link
  app.patch<{ Params: { bikeId: string }; Body: BikeBody }>(
    "/api/bikes/:bikeId",
    { preHandler: requireAuth },
    async (req, reply) => {
      const { userId } = (req as any).session;
      const { bikeId } = req.params;
      const body = req.body ?? {};
      const error = validate(body, false);
      if (error) return reply.status(400).send({ error });

      const bike = await prisma.bike.findFirst({ where: { id: bikeId, userId } });
      if (!bike) return reply.status(404).send({ error: "Bike not found" });
      if (body.stravaGearId !== undefined && (await gearTaken(userId, body.stravaGearId, bikeId))) {
        return reply.status(409).send({ error: "That Strava bike is already linked to another bike" });
      }

      const next = {
        ...(body.brand !== undefined && { brand: body.brand!.trim() }),
        ...(body.model !== undefined && { model: body.model?.trim() || null }),
        ...(body.purchaseYear !== undefined && { purchaseYear: body.purchaseYear }),
        ...(body.purchaseMonth !== undefined && { purchaseMonth: body.purchaseMonth }),
        ...(body.stravaGearId !== undefined && {
          stravaGearId: body.stravaGearId || null,
          stravaGearName: body.stravaGearId ? body.stravaGearName?.trim() || null : null,
        }),
      };

      const nextYear = next.purchaseYear !== undefined ? next.purchaseYear : bike.purchaseYear;
      const nextMonth = next.purchaseMonth !== undefined ? next.purchaseMonth : bike.purchaseMonth;
      // Year and month may arrive separately, so check the combined date too.
      if (nextYear != null && nextMonth != null && !notFuture(nextYear, nextMonth)) {
        return reply.status(400).send({ error: "Purchase date can't be in the future" });
      }

      const oldStart = bikeStartDate(bike.purchaseYear, bike.purchaseMonth);
      const newStart = bikeStartDate(nextYear, nextMonth);
      const dateChanged =
        isoDate(oldStart) !== isoDate(newStart) && !!bike.purchaseYear && !!bike.purchaseMonth;

      const updated = await prisma.$transaction(async (tx) => {
        // Components never replaced still carry the original purchase date;
        // move them with the bike. Replaced ones keep their own dates.
        if (dateChanged) {
          await tx.bikeComponent.updateMany({
            where: { bikeId, purchaseDate: oldStart },
            data: { purchaseDate: newStart },
          });
        }
        return tx.bike.update({ where: { id: bikeId }, data: next });
      });

      if (next.purchaseYear !== undefined && next.purchaseYear !== bike.purchaseYear) {
        syncUser(userId).catch(console.error);
      }
      return bikeDto(updated);
    },
  );

  // Make this the bike the dashboard opens on
  app.post<{ Params: { bikeId: string } }>(
    "/api/bikes/:bikeId/default",
    { preHandler: requireAuth },
    async (req, reply) => {
      const { userId } = (req as any).session;
      const { bikeId } = req.params;
      const bike = await prisma.bike.findFirst({ where: { id: bikeId, userId } });
      if (!bike) return reply.status(404).send({ error: "Bike not found" });
      await prisma.$transaction([
        prisma.bike.updateMany({ where: { userId }, data: { isDefault: false } }),
        prisma.bike.update({ where: { id: bikeId }, data: { isDefault: true } }),
      ]);
      return { success: true };
    },
  );

  // Delete bike
  app.delete<{ Params: { bikeId: string } }>(
    "/api/bikes/:bikeId",
    { preHandler: requireAuth },
    async (req, reply) => {
      const { userId } = (req as any).session;
      const { bikeId } = req.params;
      const bike = await prisma.bike.findFirst({ where: { id: bikeId, userId } });
      if (!bike) return reply.status(404).send({ error: "Bike not found" });

      await prisma.$transaction(async (tx) => {
        await tx.bike.delete({ where: { id: bikeId } });
        if (bike.isDefault) {
          // Hand the default to the oldest remaining bike.
          const next = await tx.bike.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
          if (next) await tx.bike.update({ where: { id: next.id }, data: { isDefault: true } });
        }
      });
      return { success: true };
    },
  );

  // Get components with health scores, using this bike's rides only
  app.get<{ Params: { bikeId: string } }>(
    "/api/bikes/:bikeId/components",
    { preHandler: requireAuth },
    async (req, reply) => {
      const { userId } = (req as any).session;
      const { bikeId } = req.params;

      const bikes = await prisma.bike.findMany({
        where: { userId },
        select: { id: true, stravaGearId: true },
      });
      if (!bikes.some((b) => b.id === bikeId)) {
        return reply.status(404).send({ error: "Bike not found" });
      }

      const [components, stats] = await Promise.all([
        prisma.bikeComponent.findMany({ where: { bikeId } }),
        loadRideStats(userId, bikes),
      ]);
      const strava = wearInput(stats.perBike.get(bikeId)!, stats.lastSyncedAt);

      return {
        stravaSummary: strava,
        components: components.map((c) => componentHealth(c, strava)),
      };
    },
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
    });
    if (!comp) return reply.status(404).send({ error: "Component not found" });

    const body = req.body ?? {};
    let purchaseDate: Date | undefined;
    if (body.purchaseDate !== undefined) {
      const d = parseComponentDate(body.purchaseDate);
      if (!d) return reply.status(400).send({ error: "Invalid component date" });
      purchaseDate = d;
    }
    if (body.brand !== undefined && body.brand !== null && (typeof body.brand !== "string" || body.brand.length > 80)) {
      return reply.status(400).send({ error: "Invalid component brand" });
    }

    const updated = await prisma.bikeComponent.update({
      where: { id: componentId },
      data: {
        ...(purchaseDate && { purchaseDate }),
        ...(body.brand !== undefined && { brand: body.brand }),
      },
    });

    const bikes = await prisma.bike.findMany({
      where: { userId },
      select: { id: true, stravaGearId: true },
    });
    const stats = await loadRideStats(userId, bikes);
    return componentHealth(updated, wearInput(stats.perBike.get(comp.bikeId)!, stats.lastSyncedAt));
  });
}
