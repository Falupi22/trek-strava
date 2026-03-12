import type { ComponentMeta, HealthLabel, HealthResult, StravaSummary } from "./types.js";

export const COMPONENT_META: ComponentMeta[] = [
  {
    id: "chain",
    name: "Chain",
    icon: "⛓️",
    wearFactors: ["km", "climb"],
    brands: ["Shimano XT", "Shimano XTR", "SRAM GX", "SRAM XX1", "KMC X12"],
  },
  {
    id: "crank",
    name: "Crankset",
    icon: "🔄",
    wearFactors: ["km"],
    brands: ["Shimano XT", "Shimano XTR", "SRAM GX Eagle", "SRAM XX1 Eagle", "Race Face Aeffect"],
  },
  {
    id: "rear_derailleur",
    name: "Rear Derailleur",
    icon: "⚙️",
    wearFactors: ["km", "climb"],
    brands: ["Shimano XT", "Shimano XTR", "SRAM GX Eagle", "SRAM XX1 Eagle", "SRAM X01"],
  },
  {
    id: "front_brake",
    name: "Front Brake Pads",
    icon: "🛑",
    wearFactors: ["descent"],
    brands: ["Shimano XT", "Shimano XTR", "SRAM Guide", "SRAM Maven", "TRP Quadiem"],
  },
  {
    id: "rear_brake",
    name: "Rear Brake Pads",
    icon: "🛑",
    wearFactors: ["descent"],
    brands: ["Shimano XT", "Shimano XTR", "SRAM Guide", "SRAM Maven", "TRP Quadiem"],
  },
  {
    id: "bearings",
    name: "Bearings",
    icon: "🔩",
    wearFactors: ["km"],
    brands: ["Enduro", "Ceramic Speed", "SKF", "Stock OEM"],
  },
];

export function calcWear(
  component: ComponentMeta,
  purchaseDateStr: string,
  strava: StravaSummary
): HealthResult {
  const now = new Date();
  const purchase = new Date(purchaseDateStr);
  const monthsOld =
    (now.getFullYear() - purchase.getFullYear()) * 12 +
    (now.getMonth() - purchase.getMonth());

  const ageWear = Math.max(0, monthsOld * 1);
  const kmWear = component.wearFactors.includes("km")
    ? Math.floor(strava.totalKm / 200) * 2
    : 0;
  const climbWear = component.wearFactors.includes("climb")
    ? Math.floor(strava.totalClimbM / 2000) * 2
    : 0;
  const descentWear = component.wearFactors.includes("descent")
    ? Math.floor(strava.totalDescentM / 2000) * 2
    : 0;

  const totalWear = ageWear + kmWear + climbWear + descentWear;
  const healthPercent = Math.max(0, Math.min(100, 100 - totalWear));

  return {
    healthPercent,
    healthLabel: getHealthLabel(healthPercent),
    healthColor: getHealthColor(healthPercent),
    wearBreakdown: { ageWear, kmWear, climbWear, descentWear },
  };
}

export function getHealthLabel(pct: number): HealthLabel {
  if (pct >= 70) return "Good";
  if (pct >= 40) return "Fair";
  return "Replace";
}

export function getHealthColor(pct: number): string {
  if (pct >= 70) return "#22c55e";
  if (pct >= 40) return "#f97316";
  return "#ef4444";
}
