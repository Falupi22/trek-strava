import type { Bike } from "@prisma/client";
import { prisma } from "./db.js";

export interface RideTotals {
  totalKm: number;
  totalClimbM: number;
  totalDescentM: number;
  activityCount: number;
}

export interface UserRideStats {
  /** All rides, across every bike (and rides with no bike set). */
  overall: RideTotals;
  lastSyncedAt: string | null;
  /** Ride totals attributed to each bike, keyed by bike id. */
  perBike: Map<string, RideTotals>;
}

const zero = (): RideTotals => ({
  totalKm: 0,
  totalClimbM: 0,
  totalDescentM: 0,
  activityCount: 0,
});

function add(into: RideTotals, t: RideTotals) {
  into.totalKm += t.totalKm;
  into.totalClimbM += t.totalClimbM;
  into.totalDescentM += t.totalDescentM;
  into.activityCount += t.activityCount;
}

// Attributes the user's ride totals to their bikes:
//  - a bike linked to a Strava gear gets exactly the rides recorded on it;
//  - an unlinked bike gets every ride not claimed by a linked bike (rides with
//    no bike set in Strava, or on Strava bikes the user hasn't linked). For a
//    single unlinked bike this is all rides, which matches the behaviour
//    before per-bike tracking.
export async function loadRideStats(
  userId: string,
  bikes: Pick<Bike, "id" | "stravaGearId">[],
): Promise<UserRideStats> {
  const [summary, gears] = await Promise.all([
    prisma.stravaSummary.findUnique({ where: { userId } }),
    prisma.gearSummary.findMany({ where: { userId } }),
  ]);

  const byGear = new Map(gears.map((g) => [g.gearId, g]));
  const linked = new Set(bikes.map((b) => b.stravaGearId).filter(Boolean));

  const unclaimed = zero();
  if (summary && !summary.historyFrom) {
    // Totals from before per-bike tracking: no per-gear rows exist until the
    // next sync rebuilds them, so unlinked bikes keep the overall totals
    // (the old behaviour) instead of dropping to zero in the meantime.
    add(unclaimed, summary);
  } else {
    for (const g of gears) if (!linked.has(g.gearId)) add(unclaimed, g);
  }

  const perBike = new Map<string, RideTotals>();
  for (const b of bikes) {
    const t = zero();
    if (b.stravaGearId) {
      const g = byGear.get(b.stravaGearId);
      if (g) add(t, g);
    } else {
      add(t, unclaimed);
    }
    perBike.set(b.id, t);
  }

  return {
    overall: summary
      ? {
          totalKm: summary.totalKm,
          totalClimbM: summary.totalClimbM,
          totalDescentM: summary.totalDescentM,
          activityCount: summary.activityCount,
        }
      : zero(),
    lastSyncedAt: summary?.lastSyncedAt?.toISOString() ?? null,
    perBike,
  };
}
