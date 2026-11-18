import { useEffect, useState, type CSSProperties } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  COMPONENT_META,
  getHealthColor,
  getHealthLabel,
} from "@bikehealth/shared";
import { bikesApi, type BikeWithStats, type RideTotals } from "../api/bikes";
import { stravaApi } from "../api/strava";
import { apiFetch } from "../api/client";
import { bikeLabel } from "../bikeOptions";
import { useI18n } from "../i18n";
import type { Dict } from "../i18n/en";
import DonutChart from "../components/DonutChart";
import UpdateModal from "../components/UpdateModal";
import EditBikeModal from "../components/EditBikeModal";
import Layout from "../components/Layout";

function getGreeting(t: Dict) {
  const g = t.dash.greetings;
  const h = new Date().getHours();
  if (h < 5) return g.midnight;
  if (h < 12) return g.morning;
  if (h < 17) return g.afternoon;
  if (h < 21) return g.evening;
  return g.night;
}

function motivationFor(t: Dict, d: RideTotals) {
  if (d.totalKm > 5000) return t.dash.motivation.km;
  if (d.totalClimbM > 5000) return t.dash.motivation.climb;
  return t.dash.motivation.default;
}

function adviceFor(t: Dict, pct: number) {
  if (pct < 40) return t.dash.advice.bad;
  if (pct < 70) return t.dash.advice.fair;
  return t.dash.advice.good;
}

// Keys are the English HealthLabel values; only the display text is translated.
const TONE: Record<string, string> = {
  Good: "var(--good)",
  Fair: "var(--fair)",
  Replace: "var(--bad)",
};

function Tally({ tally }: { tally: Record<string, number> }) {
  const { t, fmt } = useI18n();
  return (
    <div className="stat-tally">
      {(["Good", "Fair", "Replace"] as const).map((label) =>
        tally[label] ? (
          <span
            key={label}
            className="pill pill-status"
            style={{ "--tone": TONE[label] } as CSSProperties}
          >
            {fmt(tally[label])} {t.health[label]}
          </span>
        ) : null,
      )}
    </div>
  );
}

function RideStats({ stats }: { stats: RideTotals }) {
  const { t, fmt } = useI18n();
  return (
    <>
      <div className="stat">
        <div className="stat-label">{t.dash.distance}</div>
        <div className="stat-value">
          {fmt(Math.round(stats.totalKm))}
          <small>{t.common.km}</small>
        </div>
      </div>
      <div className="stat">
        <div className="stat-label">{t.dash.climbing}</div>
        <div className="stat-value">
          {fmt(stats.totalClimbM)}
          <small>{t.common.m}</small>
        </div>
      </div>
      <div className="stat">
        <div className="stat-label">{t.dash.rides}</div>
        <div className="stat-value">{fmt(stats.activityCount)}</div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, fmt } = useI18n();
  const d = t.dash;
  const [params, setParams] = useSearchParams();
  const [updateModal, setUpdateModal] = useState<any>(null);
  const [editing, setEditing] = useState<BikeWithStats | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const label = (b: BikeWithStats) => bikeLabel(b, t.common.yourBike);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("auth/me"),
  });

  const { data: bikes } = useQuery({
    queryKey: ["bikes"],
    queryFn: bikesApi.list,
    refetchInterval: 300000, // Poll every 5 minutes for updates
  });

  const { data: overall } = useQuery({
    queryKey: ["strava-summary"],
    queryFn: stravaApi.getSummary,
    refetchInterval: 300000,
  });

  // Selected view: ?bike=<id> or ?bike=all; otherwise the default bike.
  const defaultBike = bikes?.find((b) => b.isDefault) ?? bikes?.[0];
  const selParam = params.get("bike");
  // "All bikes" is available even with one bike: the totals also include rides
  // with no bike set in Strava, which no single bike's page shows.
  const showAll = selParam === "all";
  const bike = showAll
    ? undefined
    : (bikes?.find((b) => b.id === selParam) ?? defaultBike);
  const bikeId = bike?.id ?? null;

  const select = (id: string) => setParams({ bike: id }, { replace: true });

  useEffect(() => {
    if (bikes && bikes.length === 0) navigate("/setup", { replace: true });
  }, [bikes, navigate]);

  const { data } = useQuery({
    queryKey: ["components", bikeId],
    queryFn: () => bikesApi.getComponents(bikeId!),
    enabled: !!bikeId,
    refetchInterval: 300000,
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiFetch("auth/disconnect", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear(); // drop cached auth/bike data for the signed-out user
      navigate("/");
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => bikesApi.setDefault(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bikes"] }),
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["bikes"] });
    queryClient.invalidateQueries({ queryKey: ["components"] });
  };

  const displayName = (me as any)?.displayName as string | undefined;
  const athleteId = (me as any)?.stravaAthleteId;

  const actions = (
    <button
      className="btn btn-ghost btn-sm"
      onClick={() => setShowDisconnectConfirm(true)}
    >
      {d.disconnect}
    </button>
  );

  if (!bikes || bikes.length === 0 || (!showAll && !data))
    return (
      <Layout actions={actions}>
        <div className="center-screen">
          <div>
            <div className="spinner" />
            <p className="page-subtitle">{t.common.loading}</p>
          </div>
        </div>
      </Layout>
    );

  // ── Totals across all bikes ──
  const overallStats: RideTotals = {
    totalKm: overall?.totalKm ?? 0,
    totalClimbM: overall?.totalClimbM ?? 0,
    totalDescentM: overall?.totalDescentM ?? 0,
    activityCount: overall?.activityCount ?? 0,
  };
  const allTally = { Good: 0, Fair: 0, Replace: 0 } as Record<string, number>;
  for (const b of bikes)
    for (const k of Object.keys(allTally)) allTally[k] += b.health[k as keyof typeof b.health];
  const allComponents = allTally.Good + allTally.Fair + allTally.Replace;
  // Rides on Strava bikes the user doesn't track. Only meaningful when every
  // tracked bike is linked (an unlinked bike absorbs those rides).
  const untrackedKm = bikes.every((b) => b.stravaGearId)
    ? Math.max(0, overallStats.totalKm - bikes.reduce((s, b) => s + b.stats.totalKm, 0))
    : 0;

  // ── Selected bike ──
  const components: any[] = (data as any)?.components ?? [];
  const sorted = [...components].sort((a, b) => a.healthPercent - b.healthPercent);
  const tally = { Good: 0, Fair: 0, Replace: 0 } as Record<string, number>;
  for (const c of components) tally[getHealthLabel(c.healthPercent)]++;
  const needsAttention = tally.Fair + tally.Replace;

  const viewStats = showAll ? overallStats : bike!.stats;

  const star = (
    <span className="bike-tab-star" title={d.defaultTitle} aria-label={d.defaultAria}>
      ★
    </span>
  );

  return (
    <Layout actions={actions}>
      <nav className="bike-tabs fade-in" aria-label={d.tabsAria}>
        <button
          className="bike-tab"
          aria-current={showAll ? "page" : undefined}
          onClick={() => select("all")}
        >
          {d.allBikes}
        </button>
        {bikes.map((b) => (
          <button
            key={b.id}
            className="bike-tab"
            aria-current={!showAll && b.id === bikeId ? "page" : undefined}
            onClick={() => select(b.id)}
          >
            <bdi>{label(b)}</bdi>
            {b.isDefault && bikes.length > 1 && star}
          </button>
        ))}
        <button className="bike-tab bike-tab-add" onClick={() => navigate("/setup")}>
          {d.addBike}
        </button>
      </nav>

      <div className="dash-head fade-in">
        <div>
          <p className="eyebrow">
            {getGreeting(t)}
            {displayName ? <>, <bdi>{displayName}</bdi></> : ""}
          </p>
          <h1 className="page-title">
            {showAll ? d.allBikes : <bdi>{label(bike!)}</bdi>}
          </h1>
          <p className="page-subtitle">
            {showAll
              ? d.allSubtitle(bikes.length)
              : bike!.stravaGearId
                ? d.ridesOn(bike!.stravaGearName ?? d.yourStravaBike)
                : d.report}
          </p>
        </div>
        <div className="dash-head-actions">
          {!showAll && bikes.length > 1 &&
            (bike!.isDefault ? (
              <span className="pill pill-default">{d.defaultPill}</span>
            ) : (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => defaultMutation.mutate(bike!.id)}
                disabled={defaultMutation.isPending}
              >
                {d.makeDefault}
              </button>
            ))}
          {!showAll && (
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(bike!)}>
              {d.editBike}
            </button>
          )}
          {athleteId && (
            <a
              className="strava-link"
              href={`https://www.strava.com/athletes/${athleteId}`}
              target="_blank"
              rel="noopener noreferrer"
              lang="en"
            >
              {d.viewOnStrava}
            </a>
          )}
        </div>
      </div>

      {showAll ? (
        <>
          <div className="stats">
            <RideStats stats={overallStats} />
            <div className="stat">
              <div className="stat-label">{d.needsAttention}</div>
              <div className="stat-value">
                {fmt(allTally.Fair + allTally.Replace)}
                <small>{d.ofN(allComponents)}</small>
              </div>
              <Tally tally={allTally} />
            </div>
          </div>

          <div className="section-head">
            <h2 className="section-title">{d.yourBikes}</h2>
            <span className="section-meta">{d.wearMeta}</span>
          </div>

          <div className="bike-grid">
            {bikes.map((b, i) => (
              <article key={b.id} className="bike-card" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="bike-card-head">
                  <div>
                    <h3 className="bike-card-name">
                      <bdi>{label(b)}</bdi>
                      {b.isDefault && star}
                    </h3>
                    <p className="bike-card-meta">
                      {b.stravaGearId
                        ? d.stravaGear(b.stravaGearName ?? t.setup.linked)
                        : d.notLinkedCard}
                    </p>
                  </div>
                </div>
                <dl className="bike-card-stats">
                  <div>
                    <dt>{d.distance}</dt>
                    <dd>
                      {fmt(Math.round(b.stats.totalKm))} {t.common.km}
                    </dd>
                  </div>
                  <div>
                    <dt>{d.climbing}</dt>
                    <dd>
                      {fmt(b.stats.totalClimbM)} {t.common.m}
                    </dd>
                  </div>
                  <div>
                    <dt>{d.rides}</dt>
                    <dd>{fmt(b.stats.activityCount)}</dd>
                  </div>
                </dl>
                <Tally tally={b.health} />
                <div className="comp-foot">
                  <button className="btn btn-ghost btn-sm" onClick={() => select(b.id)}>
                    {d.viewComponents}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {untrackedKm >= 1 && (
            <p className="field-hint" style={{ marginTop: 16 }}>
              {d.untracked(fmt(Math.round(untrackedKm)))}
            </p>
          )}
        </>
      ) : (
        <>
          {!bike!.stravaGearId && bikes.length > 1 && (
            <div className="notice" style={{ marginBottom: 20 }}>
              <span className="notice-icon">🔗</span>
              <span>
                {d.unlinkedBefore}
                <button className="btn btn-link btn-inline" onClick={() => setEditing(bike!)}>
                  {d.unlinkedLink}
                </button>
                {d.unlinkedAfter}
              </span>
            </div>
          )}

          <div className="stats">
            <RideStats stats={bike!.stats} />
            <div className="stat">
              <div className="stat-label">{d.needsAttention}</div>
              <div className="stat-value">
                {fmt(needsAttention)}
                <small>{d.ofN(components.length)}</small>
              </div>
              <Tally tally={tally} />
            </div>
          </div>

          <div className="section-head">
            <h2 className="section-title">{d.componentsTitle}</h2>
            <span className="section-meta">{d.sortedByWear}</span>
          </div>

          <div className="comp-grid">
            {sorted.map((comp, i) => {
              const meta = COMPONENT_META.find((m) => m.id === comp.type)!;
              const pct = comp.healthPercent;
              return (
                <article
                  key={comp.id}
                  className="comp"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="comp-body">
                    <DonutChart percent={pct} />
                    <div className="comp-info">
                      <div className="comp-name">
                        <span aria-hidden>{meta.icon}</span>
                        {t.components[meta.id]}
                      </div>
                      <span
                        className="pill pill-status"
                        style={{ "--tone": getHealthColor(pct) } as CSSProperties}
                      >
                        {t.health[getHealthLabel(pct)]}
                      </span>
                      <p className="comp-advice">{adviceFor(t, pct)}</p>
                    </div>
                  </div>
                  <div className="comp-foot">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setUpdateModal({ ...comp, meta })}
                    >
                      {d.updateComponent}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <p className="quote">{motivationFor(t, viewStats)}</p>

      <div className="notice">
        <span className="notice-icon">ℹ️</span>
        <span>{d.disclaimer}</span>
      </div>

      {showDisconnectConfirm && (
        <div
          className="overlay"
          onClick={() => setShowDisconnectConfirm(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="disconnect-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="disconnect-title">{d.disconnectTitle}</h2>
            <p>
              {d.disconnectBefore}
              <a
                href="https://www.strava.com/legal/api"
                target="_blank"
                rel="noopener noreferrer"
              >
                {d.disconnectLink}
              </a>
              {d.disconnectAfter}
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDisconnectConfirm(false)}
              >
                {t.common.cancel}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowDisconnectConfirm(false);
                  disconnectMutation.mutate();
                }}
              >
                {d.disconnectConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <EditBikeModal
          bike={editing}
          allBikes={bikes}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refreshAll();
          }}
          onDeleted={() => {
            setEditing(null);
            setParams({}, { replace: true });
            refreshAll();
          }}
        />
      )}

      {updateModal && (
        <UpdateModal
          comp={updateModal}
          onClose={() => setUpdateModal(null)}
          onSave={() => {
            refreshAll();
            setUpdateModal(null);
          }}
        />
      )}
    </Layout>
  );
}
