// Product names: shown as-is in every language.
export const TREK_MODELS = [
  "Supercaliber",
  "Fuel EX",
  "Top Fuel",
  "Slash",
  "Procaliber",
  "Marlin",
  "Powerfly",
  "Madone",
  "Domane",
  "Émonda",
];

// Current year back ten years, so the list never goes stale.
export const YEARS = Array.from(
  { length: 11 },
  (_, i) => new Date().getFullYear() - i,
);

/**
 * Month indexes (0-11) selectable for `year`: every month for past years, but
 * only up to the current month for this year, so no date lies in the future.
 */
export function monthIndexesFor(year: string): number[] {
  const now = new Date();
  const last = parseInt(year) === now.getFullYear() ? now.getMonth() : 11;
  return Array.from({ length: last + 1 }, (_, i) => i);
}

/** Clears `month` if it's no longer valid for `year` (e.g. year changed to this year). */
export function keepMonthIfValid(year: string, month: string | undefined): string {
  if (!month) return "";
  return monthIndexesFor(year).includes(parseInt(month)) ? month : "";
}

export interface BikeLike {
  brand: string;
  model: string | null;
  stravaGearName?: string | null;
}

/**
 * Display name: "Trek Fuel EX", "Specialized Stumpjumper", or the Strava name.
 * "Other" is a stored value meaning "no brand given", so it's never shown;
 * `fallback` (translated) is used when there's nothing else to show.
 */
export function bikeLabel(b: BikeLike, fallback: string): string {
  const name = [b.brand !== "Other" ? b.brand : null, b.model]
    .filter(Boolean)
    .join(" ");
  return name || b.stravaGearName || fallback;
}
