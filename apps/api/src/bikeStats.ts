import type { Bike } from "@prisma/client";
import { prisma } from "./db.js";

export interface RideTotals {
  totalKm: number;
  totalClimbM: number;
  totalDescentM: number;
  activityCount: number;
}

export type BikeRef = Pick<Bike, "id" | "stravaGearId" | "purchaseYear" | "purchaseMonth">;

export interface BikeRides {
  /** Rides counted for the bike: from its purchase month on. */
  totals: RideTotals;
  /**
   * Rides recorded on the bike's linked Strava gear BEFORE its purchase month.
   * Not counted toward wear; reported so the rider knows why. Null when there
   * are none, or the bike isn't linked (then no ride is known to be "its").
   */
  beforePurchase: RideTotals | null;
  /** Rides counted for a component dated `date`: from the later of the bike's
   *  purchase month and the component's month. */
  since(date: Date): RideTotals;
}

export interface UserRideStats {
  /** All synced rides, across every bike (and rides with no bike set). */
  overall: RideTotals;
  lastSyncedAt: string | null;
  bikes: Map<string, BikeRides>;
  /** Totals predate monthly tracking: showing the fallback until a rebuild. */
  needsRebuild: boolean;
}

const zero = (): RideTotals => ({
  totalKm: 0,
  totalClimbM: 0,
  totalDescentM: 0,
  activityCount: 0,
});

function sum(rows: RideTotals[]): RideTotals {
  const t = zero();
  for (const r of rows) {
    t.totalKm += r.totalKm;
    t.totalClimbM += r.totalClimbM;
    t.totalDescentM += r.totalDescentM;
    t.activityCount += r.activityCount;
  }
  return t;
}

/**
 * First of the month (UTC) a stored date belongs to. Dates are meant to be the
 * 1st of a month, but an older client built them with toISOString() on a local
 * date, which east of UTC stored the LAST day of the previous month (Mar 1 →
 * Feb 29). Any date on the last day of a month is therefore read as the
 * following month.
 */
export function monthStart(d: Date): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  if (day !== 1 && day === lastDay) return new Date(Date.UTC(y, m + 1, 1));
  return new Date(Date.UTC(y, m, 1));
}

/** The bike's purchase month, or null when no purchase date was entered. */
export function bikeStart(b: Pick<Bike, "purchaseYear" | "purchaseMonth">): Date | null {
  return b.purchaseYear && b.purchaseMonth
    ? new Date(Date.UTC(b.purchaseYear, b.purchaseMonth - 1, 1))
    : null;
}

// Attributes the user's monthly ride totals to their bikes:
//  - a bike linked to a Strava gear gets the rides recorded on that gear;
//  - an unlinked bike gets every ride not claimed by a linked bike (rides with
//    no bike set in Strava, or on Strava bikes the user hasn't linked).
// Either way only rides from the bike's purchase month on count; a component
// counts only rides from its own (purchase/replacement) month on.
export async function loadRideStats(userId: string, bikes: BikeRef[]): Promise<UserRideStats> {
  const [summary, months] = await Promise.all([
    prisma.stravaSummary.findUnique({ where: { userId } }),
    prisma.gearMonthSummary.findMany({ where: { userId } }),
  ]);

  const overall = summary
    ? {
        totalKm: summary.totalKm,
        totalClimbM: summary.totalClimbM,
        totalDescentM: summary.totalDescentM,
        activityCount: summary.activityCount,
      }
    : zero();
  const linked = new Set(bikes.map((b) => b.stravaGearId).filter(Boolean));
  const result = new Map<string, BikeRides>();

  // Totals from before monthly tracking (historyFrom null): no monthly rows
  // exist until the next sync rebuilds them, so unlinked bikes keep the overall
  // totals (the old behaviour) instead of dropping to zero in the meantime.
  const needsRebuild = !!summary && !summary.historyFrom;
  if (needsRebuild) {
    for (const b of bikes) {
      const t = b.stravaGearId ? zero() : { ...overall };
      result.set(b.id, { totals: t, beforePurchase: null, since: () => ({ ...t }) });
    }
  } else {
    for (const b of bikes) {
      const rows = months.filter((m) =>
        b.stravaGearId ? m.gearId === b.stravaGearId : !linked.has(m.gearId),
      );
      const start = bikeStart(b);
      const from = (date: Date | null) =>
        sum(rows.filter((r) => !date || r.month >= date));
      const before = b.stravaGearId && start ? sum(rows.filter((r) => r.month < start)) : null;

      result.set(b.id, {
        totals: from(start),
        beforePurchase: before && before.activityCount > 0 ? before : null,
        since: (date) => {
          const m = monthStart(date);
          return from(start && start > m ? start : m);
        },
      });
    }
  }

  return {
    overall,
    lastSyncedAt: summary?.lastSyncedAt?.toISOString() ?? null,
    bikes: result,
    needsRebuild,
  };
}
