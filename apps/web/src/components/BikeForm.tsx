import { useQuery } from "@tanstack/react-query";
import { COMPONENT_META } from "@bikehealth/shared";
import { stravaApi, type StravaBike } from "../api/strava";
import type { Bike, BikeFields } from "../api/bikes";
import {
  TREK_MODELS,
  YEARS,
  bikeLabel,
  keepMonthIfValid,
  monthIndexesFor,
  yearsFrom,
  type YearMonth,
} from "../bikeOptions";
import { useI18n } from "../i18n";

// ── Draft model ───────────────────────────────────────────────────────

export interface BikeDraft {
  key: string;
  brandKind: "Trek" | "Other" | null;
  otherBrand: string;
  model: string;
  year: string;
  month: string; // "0".."11"
  stravaGearId: string; // "" = not linked
  hasReplacements: boolean | null;
  /** Replaced components; a key being present means it's ticked. */
  replaced: Record<string, { month?: string; year?: string }>;
}

let seq = 0;
export function newDraft(): BikeDraft {
  return {
    key: `draft-${++seq}`,
    brandKind: null,
    otherBrand: "",
    model: "",
    year: "",
    month: "",
    stravaGearId: "",
    hasReplacements: null,
    replaced: {},
  };
}

export function draftFromBike(b: Bike): BikeDraft {
  return {
    ...newDraft(),
    brandKind: b.brand === "Trek" ? "Trek" : "Other",
    otherBrand: b.brand === "Trek" || b.brand === "Other" ? "" : b.brand,
    model: b.model ?? "",
    year: b.purchaseYear ? String(b.purchaseYear) : "",
    month: b.purchaseMonth ? String(b.purchaseMonth - 1) : "",
    stravaGearId: b.stravaGearId ?? "",
  };
}

export function isDraftValid(d: BikeDraft, withReplacements: boolean): boolean {
  if (!d.brandKind) return false;
  if (d.brandKind === "Trek" && !d.model) return false;
  if (!d.year || d.month === "") return false;
  if (withReplacements && d.hasReplacements === null) return false;
  if (withReplacements && d.hasReplacements && !replacementDatesComplete(d)) return false;
  return true;
}

/** Every ticked replaced component has both a month and a year. */
export function replacementDatesComplete(d: BikeDraft): boolean {
  return Object.values(d.replaced).every((r) => !!r.year && !!r.month);
}

// YYYY-MM-01 built directly, so the date can't shift a day across time zones.
const firstOfMonth = (year: string, monthIdx: string) =>
  `${year}-${String(parseInt(monthIdx) + 1).padStart(2, "0")}-01`;

export function draftToFields(d: BikeDraft, gear: StravaBike[] = []): BikeFields {
  const brand =
    d.brandKind === "Trek" ? "Trek" : d.otherBrand.trim() || "Other";
  return {
    brand,
    model: d.model.trim() || null,
    purchaseYear: parseInt(d.year),
    purchaseMonth: parseInt(d.month) + 1,
    stravaGearId: d.stravaGearId || null,
    stravaGearName: gear.find((g) => g.id === d.stravaGearId)?.name ?? null,
  };
}

export function draftComponents(d: BikeDraft) {
  const out: Record<string, { purchaseDate: string }> = {};
  if (!d.hasReplacements) return out;
  for (const [id, date] of Object.entries(d.replaced)) {
    if (date.year && date.month != null && date.month !== "") {
      out[id] = { purchaseDate: firstOfMonth(date.year, date.month) };
    }
  }
  return out;
}

export function draftLabel(d: BikeDraft, gear: StravaBike[], fallback: string): string {
  return bikeLabel({ ...draftToFields(d, gear), model: d.model.trim() || null }, fallback);
}

// ── Strava gear ───────────────────────────────────────────────────────

/** The athlete's Strava bikes. Each fetch calls Strava, so cache generously. */
export function useStravaGear() {
  return useQuery({
    queryKey: ["strava-gear"],
    queryFn: stravaApi.getGear,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

// ── Form ──────────────────────────────────────────────────────────────

interface Props {
  draft: BikeDraft;
  onChange: (d: BikeDraft) => void;
  /** Ask about replaced components (new bikes only; existing ones are edited per component). */
  withReplacements?: boolean;
  /** Strava gear already linked to another bike, so it can't be picked twice. */
  takenGearIds?: Set<string>;
  idPrefix?: string;
}

export default function BikeForm({
  draft: d,
  onChange,
  withReplacements = false,
  takenGearIds = new Set(),
  idPrefix = "bike",
}: Props) {
  const { t } = useI18n();
  const f = t.bikeForm;
  const gear = useStravaGear();
  // Tag one Strava bike to help the rider recognise it: the one with the most
  // km; if none has any km yet, Strava's primary bike instead.
  const highlighted = (() => {
    const bikes = gear.data?.bikes ?? [];
    const top = bikes.reduce<StravaBike | undefined>(
      (best, g) => (g.km > (best?.km ?? 0) ? g : best),
      undefined,
    );
    if (top) return { id: top.id, label: f.mostRidden };
    const primary = bikes.find((g) => g.primary);
    return primary ? { id: primary.id, label: f.primary } : undefined;
  })();
  const set = (patch: Partial<BikeDraft>) => onChange({ ...d, ...patch });
  // A component can't have been replaced before the bike was bought, so its
  // replacement date starts at the bike's purchase month.
  const purchase: YearMonth = { year: d.year, month: d.month };
  // Changing the purchase date drops replacement dates that now fall before it.
  const setPurchase = (year: string, month: string) => {
    const from: YearMonth = { year, month };
    const replaced: BikeDraft["replaced"] = {};
    for (const [id, r] of Object.entries(d.replaced)) {
      if (r.year && year && parseInt(r.year) < parseInt(year)) replaced[id] = {};
      else replaced[id] = { year: r.year, month: r.year ? keepMonthIfValid(r.year, r.month, from) : r.month };
    }
    set({ year, month, replaced });
  };
  const setReplacedDate = (id: string, field: "month" | "year", val: string) => {
    const prev = d.replaced[id] ?? {};
    const next =
      field === "year"
        ? { year: val, month: keepMonthIfValid(val, prev.month, purchase) }
        : { ...prev, month: val };
    set({ replaced: { ...d.replaced, [id]: next } });
  };
  const toggleReplaced = (id: string) => {
    const next = { ...d.replaced };
    if (next[id]) delete next[id];
    else next[id] = {};
    set({ replaced: next });
  };

  const brandDone = d.brandKind === "Other" || (d.brandKind === "Trek" && !!d.model);
  const dateDone = !!d.year && d.month !== "";

  return (
    <>
      <div className="field">
        <span className="field-label">{f.whatBike}</span>
        <div className="choices">
          {[
            { id: "Trek" as const, label: "Trek", hint: f.trekHint },
            { id: "Other" as const, label: f.otherBrand, hint: f.otherHint },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              className="choice"
              aria-pressed={d.brandKind === b.id}
              onClick={() => set({ brandKind: b.id, model: d.brandKind === b.id ? d.model : "" })}
            >
              {b.label}
              <small>{b.hint}</small>
            </button>
          ))}
        </div>
      </div>

      {d.brandKind === "Trek" && (
        <div className="field fade-in">
          <label className="field-label" htmlFor={`${idPrefix}-model`}>
            {f.model}
          </label>
          <select
            id={`${idPrefix}-model`}
            className="select"
            value={d.model}
            onChange={(e) => set({ model: e.target.value })}
          >
            <option value="">{f.selectModel}</option>
            {TREK_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      {d.brandKind === "Other" && (
        <div className="field fade-in">
          <span className="field-label">{f.brandModelOptional}</span>
          <div className="row">
            <input
              className="input"
              aria-label={f.brandPh}
              placeholder={f.brandPh}
              dir="auto"
              maxLength={60}
              value={d.otherBrand}
              onChange={(e) => set({ otherBrand: e.target.value })}
            />
            <input
              className="input"
              aria-label={f.modelPh}
              placeholder={f.modelPh}
              dir="auto"
              maxLength={80}
              value={d.model}
              onChange={(e) => set({ model: e.target.value })}
            />
          </div>
        </div>
      )}

      {brandDone && (
        <div className="field fade-in">
          <span className="field-label">{f.purchaseDate}</span>
          <div className="row">
            <select
              className="select"
              aria-label={f.yearAria}
              value={d.year}
              onChange={(e) =>
                setPurchase(e.target.value, keepMonthIfValid(e.target.value, d.month))
              }
            >
              <option value="">{t.common.year}</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="select"
              aria-label={f.monthAria}
              value={d.month}
              disabled={!d.year}
              onChange={(e) => setPurchase(d.year, e.target.value)}
            >
              <option value="">{t.common.month}</option>
              {monthIndexesFor(d.year).map((i) => (
                <option key={i} value={i}>
                  {t.months[i]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {brandDone && dateDone && (
        <div className="field fade-in">
          <label className="field-label" htmlFor={`${idPrefix}-gear`}>
            {f.whichStrava}
          </label>
          {gear.data?.needsReconnect ? (
            <div className="notice">
              <span className="notice-icon">🔗</span>
              <span>
                {f.reconnectText}{" "}
                <a href="/auth/strava?reconnect=1">{f.reconnect}</a>
              </span>
            </div>
          ) : gear.isError ? (
            <p className="field-hint">
              {f.gearError}
            </p>
          ) : (
            <>
              <select
                id={`${idPrefix}-gear`}
                className="select"
                value={d.stravaGearId}
                disabled={gear.isLoading}
                onChange={(e) => set({ stravaGearId: e.target.value })}
              >
                <option value="">
                  {gear.isLoading ? f.gearLoading : f.notLinked}
                </option>
                {gear.data?.bikes.map((g) => {
                  const taken = takenGearIds.has(g.id) && g.id !== d.stravaGearId;
                  return (
                    <option key={g.id} value={g.id} disabled={taken}>
                      {g.name}
                      {g.id === highlighted?.id ? highlighted.label : ""}
                      {g.retired ? f.retired : ""}
                      {taken ? f.taken : ""}
                    </option>
                  );
                })}
              </select>
              <p className="field-hint">
                {d.stravaGearId
                  ? f.hintLinked
                  : gear.data && gear.data.bikes.length === 0
                    ? f.hintNoGear
                    : f.hintUnlinked}
              </p>
            </>
          )}
        </div>
      )}

      {withReplacements && brandDone && dateDone && (
        <div className="field fade-in">
          <span className="field-label">
            {f.replacedQ}
          </span>
          <div className="choices">
            {[
              { id: false, label: t.common.no },
              { id: true, label: t.common.yes },
            ].map((o) => (
              <button
                key={String(o.id)}
                type="button"
                className="choice"
                aria-pressed={d.hasReplacements === o.id}
                onClick={() => set({ hasReplacements: o.id })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {withReplacements && d.hasReplacements === true && (
        <div className="field fade-in">
          <span className="field-label">{f.whichReplaced}</span>
          <div className="check-list">
            {COMPONENT_META.map((comp) => {
              const checked = !!d.replaced[comp.id];
              const name = t.components[comp.id];
              return (
                <div key={comp.id} className="check-item" data-checked={checked}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleReplaced(comp.id)}
                    />
                    <span>
                      {comp.icon} {name}
                    </span>
                  </label>
                  {checked && (
                    <div className="row fade-in">
                      <select
                        className="select"
                        aria-label={f.replMonthAria(name)}
                        value={d.replaced[comp.id]?.month ?? ""}
                        onChange={(e) => setReplacedDate(comp.id, "month", e.target.value)}
                      >
                        <option value="">{t.common.month}</option>
                        {monthIndexesFor(d.replaced[comp.id]?.year ?? "", purchase).map((i) => (
                          <option key={i} value={i}>
                            {t.months[i]}
                          </option>
                        ))}
                      </select>
                      <select
                        className="select"
                        aria-label={f.replYearAria(name)}
                        value={d.replaced[comp.id]?.year ?? ""}
                        onChange={(e) => setReplacedDate(comp.id, "year", e.target.value)}
                      >
                        <option value="">{t.common.year}</option>
                        {yearsFrom(purchase).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!replacementDatesComplete(d) && (
            <p className="field-hint">{f.replDateMissing}</p>
          )}
        </div>
      )}
    </>
  );
}
