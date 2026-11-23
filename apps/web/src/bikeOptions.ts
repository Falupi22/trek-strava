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

/** A year + month index ("0".."11", or "" if not chosen yet) from a form. */
export interface YearMonth {
  year: string;
  month: string;
}

/** Years selectable for a date that can't be before `from` (e.g. the bike's purchase). */
export function yearsFrom(from?: YearMonth): number[] {
  return from?.year ? YEARS.filter((y) => y >= parseInt(from.year)) : YEARS;
}

/**
 * Month indexes (0-11) selectable for `year`: every month for past years, but
 * only up to the current month for this year, so no date lies in the future —
 * and, given `from`, none before that month either.
 */
export function monthIndexesFor(year: string, from?: YearMonth): number[] {
  const now = new Date();
  const last = parseInt(year) === now.getFullYear() ? now.getMonth() : 11;
  const first =
    from?.year && from.month !== "" && parseInt(year) === parseInt(from.year)
      ? parseInt(from.month)
      : 0;
  return Array.from({ length: last + 1 }, (_, i) => i).filter((i) => i >= first);
}

/** Clears `month` if it's no longer valid for `year` (e.g. year changed to this year). */
export function keepMonthIfValid(
  year: string,
  month: string | undefined,
  from?: YearMonth,
): string {
  if (!month) return "";
  return monthIndexesFor(year, from).includes(parseInt(month)) ? month : "";
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
