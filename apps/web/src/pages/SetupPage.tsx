import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bikesApi } from "../api/bikes";
import { stravaApi } from "../api/strava";
import Layout from "../components/Layout";
import BikeForm, {
  draftComponents,
  draftLabel,
  draftToFields,
  isDraftValid,
  newDraft,
  useStravaGear,
  type BikeDraft,
} from "../components/BikeForm";
import { useI18n } from "../i18n";

export default function SetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const s = t.setup;
  const gear = useStravaGear();
  const gearList = gear.data?.bikes ?? [];
  const label = (d: BikeDraft) => draftLabel(d, gearList, t.common.yourBike);

  // Users who already have bikes land here via "Add bike".
  const { data: existing } = useQuery({ queryKey: ["bikes"], queryFn: bikesApi.list });
  const adding = !!existing && existing.length > 0;

  const [saved, setSaved] = useState<BikeDraft[]>([]);
  const [current, setCurrent] = useState<BikeDraft>(newDraft);
  const [defaultKey, setDefaultKey] = useState<string | null>(null);
  // Drafts already created on the server, so a retry after a partial failure
  // doesn't create them twice.
  const created = useRef(new Map<string, string>());

  const currentBlank = current.brandKind === null;
  const currentValid = isDraftValid(current, true);
  const bikes = currentValid ? [...saved, current] : saved;
  const canFinish = bikes.length > 0 && (currentBlank || currentValid);
  // The rider's pick; otherwise the bike linked to their Strava primary gear;
  // otherwise the first bike entered.
  const primaryGearId = gearList.find((g) => g.primary)?.id;
  const effectiveDefault =
    bikes.find((b) => b.key === defaultKey)?.key ??
    (primaryGearId ? bikes.find((b) => b.stravaGearId === primaryGearId)?.key : undefined) ??
    bikes[0]?.key;

  const takenGearIds = new Set(
    [
      ...(existing ?? []).map((b) => b.stravaGearId),
      ...saved.map((b) => b.stravaGearId),
    ].filter((id): id is string => !!id),
  );

  const addAnother = () => {
    if (!currentValid) return;
    setSaved((list) => [...list, current]);
    setCurrent(newDraft());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (key: string) => setSaved((list) => list.filter((b) => b.key !== key));

  const mutation = useMutation({
    mutationFn: async () => {
      let firstId: string | undefined;
      for (const d of bikes) {
        let id = created.current.get(d.key);
        if (!id) {
          const bike = await bikesApi.create({
            ...draftToFields(d, gearList),
            components: draftComponents(d),
            // When adding to an existing garage, keep the current default.
            isDefault: !adding && d.key === effectiveDefault,
          });
          id = bike.id;
          created.current.set(d.key, id);
        }
        firstId ??= id;
      }
      await stravaApi.sync();
      return firstId;
    },
    onSuccess: (firstId) => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      if (adding) navigate(`/dashboard?bike=${firstId}`);
      else navigate("/processing");
    },
  });

  const actions = adding ? (
    <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>
      {s.backToDashboard}
    </button>
  ) : undefined;

  const monthName = (d: BikeDraft) => t.months[parseInt(d.month)];

  return (
    <Layout narrow actions={actions}>
      <div className="fade-in" style={{ marginBottom: 24 }}>
        <p className="eyebrow">{adding ? s.eyebrowAdd : s.eyebrowSetup}</p>
        <h1 className="page-title">{adding ? s.titleAdd : s.titleSetup}</h1>
        <p className="page-subtitle">{s.subtitle}</p>
      </div>

      {saved.length > 0 && (
        <ul className="draft-list fade-in" aria-label={s.savedListAria}>
          {saved.map((b) => (
            <li key={b.key} className="draft">
              <div className="draft-info">
                <strong>{label(b)}</strong>
                <span>
                  {s.bought(monthName(b), b.year)}
                  {b.stravaGearId &&
                    ` · ${t.dash.stravaGear(gearList.find((g) => g.id === b.stravaGearId)?.name ?? s.linked)}`}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-link btn-sm"
                onClick={() => remove(b.key)}
                aria-label={s.removeAria(label(b))}
              >
                {s.remove}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="card">
        <p className="eyebrow">{s.bikeN(saved.length + 1)}</p>
        <BikeForm
          draft={current}
          onChange={setCurrent}
          withReplacements
          takenGearIds={takenGearIds}
          idPrefix={current.key}
        />

        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={addAnother}
          disabled={!currentValid}
        >
          {s.addAnother}
        </button>
      </div>

      {!adding && bikes.length > 1 && (
        <div className="card fade-in" style={{ marginTop: 16 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <span className="field-label">{s.defaultQ}</span>
            <div className="choices">
              {bikes.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  className="choice"
                  aria-pressed={effectiveDefault === b.key}
                  onClick={() => setDefaultKey(b.key)}
                >
                  {label(b)}
                  <small>
                    {monthName(b)} {b.year}
                  </small>
                </button>
              ))}
            </div>
            <p className="field-hint">{s.defaultHint}</p>
          </div>
        </div>
      )}

      {mutation.isError && (
        <div className="notice notice-error" style={{ marginTop: 16 }}>
          <span className="notice-icon">⚠️</span>
          {t.common.genericError}
        </div>
      )}

      {!currentBlank && !currentValid && saved.length > 0 && (
        <p className="field-hint" style={{ marginTop: 16 }}>
          {s.finishOrClear(saved.length + 1)}{" "}
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={() => setCurrent(newDraft())}
          >
            {s.clearIt}
          </button>
        </p>
      )}

      <button
        className="btn btn-primary btn-block"
        onClick={() => mutation.mutate()}
        disabled={!canFinish || mutation.isPending}
        style={{ marginTop: 16 }}
      >
        {mutation.isPending
          ? t.common.saving
          : adding
            ? bikes.length > 1
              ? s.addMany(bikes.length)
              : s.addOne
            : bikes.length > 1
              ? s.checkMany(bikes.length)
              : s.checkOne}
      </button>
    </Layout>
  );
}
