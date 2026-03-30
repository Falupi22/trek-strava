import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { COMPONENT_META } from "@bikehealth/shared";
import { bikesApi } from "../api/bikes";
import { stravaApi } from "../api/strava";
import StravaAttribution from "../components/StravaAttribution";
import { s } from "../styles";

const TREK_MODELS = [
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
const YEARS = Array.from({ length: 8 }, (_, i) => 2024 - i);
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function SetupPage() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState<string | null>(null);
  const [trekModel, setTrekModel] = useState("");
  const [trekYear, setTrekYear] = useState("");
  const [trekMonth, setTrekMonth] = useState("");
  const [hasReplacements, setHasReplacements] = useState<boolean | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<
    Record<string, boolean>
  >({});
  const [componentDates, setComponentDates] = useState<
    Record<string, { month?: string; year?: string }>
  >({});

  const toggleComp = (id: string) =>
    setSelectedComponents((p) => ({ ...p, [id]: !p[id] }));
  const setCompDate = (id: string, field: string, val: string) =>
    setComponentDates((p) => ({ ...p, [id]: { ...p[id], [field]: val } }));

  const canProceed =
    brand === "Trek"
      ? !!(trekModel && trekYear && trekMonth && hasReplacements !== null)
      : !!(brand && hasReplacements !== null);

  const mutation = useMutation({
    mutationFn: async () => {
      const purchaseYear = trekYear ? parseInt(trekYear) : undefined;
      const purchaseMonth = trekMonth ? parseInt(trekMonth) + 1 : undefined;

      const components: Record<
        string,
        { purchaseDate: string; brand?: string }
      > = {};
      COMPONENT_META.forEach((meta) => {
        const replaced = selectedComponents[meta.id];
        const dates = componentDates[meta.id] || {};
        if (replaced && dates.year && dates.month != null) {
          const d = new Date(parseInt(dates.year), parseInt(dates.month), 1);
          components[meta.id] = { purchaseDate: d.toISOString().split("T")[0] };
        }
      });

      const bike = await bikesApi.create({
        brand: brand!,
        model: trekModel || undefined,
        purchaseYear,
        purchaseMonth,
        components,
      });
      await stravaApi.sync();
      return bike;
    },
    onSuccess: () => navigate("/processing"),
  });

  return (
    <>
      <div style={s.screen}>
        <div style={{ ...s.card, maxWidth: 540 }}>
          <h2 style={{ ...s.title, fontSize: 22, marginBottom: 24 }}>
            ⚙️ Set Up Your Bike
          </h2>

          <div style={s.section}>
            <label style={s.label}>What bike do you ride?</label>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { id: "Trek", label: "Trek 🚵" },
                { id: "Other", label: "Other Brand 🔧" },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBrand(b.id)}
                  style={{
                    ...s.optionBtn,
                    ...(brand === b.id ? s.optionBtnActive : {}),
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {brand === "Trek" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                animation: "fadeIn 0.3s",
              }}
            >
              <div style={s.section}>
                <label style={s.label}>Model</label>
                <select
                  style={s.select}
                  value={trekModel}
                  onChange={(e) => setTrekModel(e.target.value)}
                >
                  <option value="">Select model</option>
                  {TREK_MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              {trekModel && (
                <div style={s.section}>
                  <label style={s.label}>Year of Purchase</label>
                  <select
                    style={s.select}
                    value={trekYear}
                    onChange={(e) => setTrekYear(e.target.value)}
                  >
                    <option value="">Select year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {trekYear && (
                <div style={s.section}>
                  <label style={s.label}>Month of Purchase</label>
                  <select
                    style={s.select}
                    value={trekMonth}
                    onChange={(e) => setTrekMonth(e.target.value)}
                  >
                    <option value="">Select month</option>
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {brand && (brand !== "Trek" || trekMonth) && (
            <div style={{ ...s.section, animation: "fadeIn 0.3s" }}>
              <label style={s.label}>
                Have any components been replaced since purchase?
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { id: false, label: "No" },
                  { id: true, label: "Yes" },
                ].map((o) => (
                  <button
                    key={String(o.id)}
                    onClick={() => setHasReplacements(o.id)}
                    style={{
                      ...s.optionBtn,
                      ...(hasReplacements === o.id ? s.optionBtnActive : {}),
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasReplacements === true && (
            <div style={{ ...s.section, animation: "fadeIn 0.3s" }}>
              <label style={s.label}>Which components were replaced?</label>
              {COMPONENT_META.map((comp) => (
                <div key={comp.id} style={{ marginBottom: 10 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      color: "#363636",
                      fontSize: 14,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedComponents[comp.id]}
                      onChange={() => toggleComp(comp.id)}
                      style={{ width: 15, height: 15, accentColor: "#ed1b24" }}
                    />
                    {comp.icon} {comp.name}
                  </label>
                  {selectedComponents[comp.id] && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 8,
                        marginLeft: 26,
                        animation: "fadeIn 0.2s",
                      }}
                    >
                      <select
                        style={{ ...s.select, flex: 1 }}
                        value={componentDates[comp.id]?.month ?? ""}
                        onChange={(e) =>
                          setCompDate(comp.id, "month", e.target.value)
                        }
                      >
                        <option value="">Month</option>
                        {MONTHS.map((m, i) => (
                          <option key={i} value={i}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <select
                        style={{ ...s.select, flex: 1 }}
                        value={componentDates[comp.id]?.year ?? ""}
                        onChange={(e) =>
                          setCompDate(comp.id, "year", e.target.value)
                        }
                      >
                        <option value="">Year</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {mutation.isError && (
            <p style={{ color: "#363636", fontSize: 13 }}>
              Something went wrong. Please try again.
            </p>
          )}

          <button
            onClick={() => mutation.mutate()}
            disabled={!canProceed || mutation.isPending}
            style={{
              ...s.primaryBtn,
              opacity: canProceed && !mutation.isPending ? 1 : 0.4,
              marginTop: 24,
            }}
          >
            {mutation.isPending ? "Saving…" : "Check My Bike Health 🔍"}
          </button>
        </div>
      </div>

      <StravaAttribution />
    </>
  );
}
