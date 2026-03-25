import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { COMPONENT_META, getHealthColor } from "@bikehealth/shared";
import { bikesApi } from "../api/bikes";
import { useAuthStore } from "../stores/authStore";
import { apiFetch } from "../api/client";
import DonutChart from "../components/DonutChart";
import UpdateModal from "../components/UpdateModal";
import { s } from "../styles";

const MOTIVATION = [
  { condition: (d: any) => d.totalKm > 5000, text: "We thought our system crashed from all those kilometers you've been grinding. Got a trail coming up soon? 🚵" },
  { condition: (d: any) => d.totalClimbM > 5000, text: "How about some flat ground? Your bike does nothing but climb all day — it's not like we've got Everest around here ⛰️" },
  { condition: () => true, text: "Your bike is doing incredible work out there! The wrench is proud of you 🤘" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const clearToken = useAuthStore((s) => s.clearToken);
  const queryClient = useQueryClient();
  const [updateModal, setUpdateModal] = useState<any>(null);
  const [bikeId, setBikeId] = useState<string | null>(null);

  const { data: bikes } = useQuery({
    queryKey: ["bikes"],
    queryFn: bikesApi.list,
    onSuccess: (data: any[]) => { if (data[0]) setBikeId(data[0].id); },
  } as any);

  const resolvedBikeId = bikeId ?? (bikes as any)?.[0]?.id;

  const { data } = useQuery({
    queryKey: ["components", resolvedBikeId],
    queryFn: () => bikesApi.getComponents(resolvedBikeId!),
    enabled: !!resolvedBikeId,
    refetchInterval: 300000, // Poll every 5 minutes for updates
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiFetch("auth/disconnect", { method: "POST" }),
    onSuccess: () => { clearToken(); navigate("/"); },
  });

  const resetBikeMutation = useMutation({
    mutationFn: () => bikesApi.deleteBike(resolvedBikeId!),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bikes"] }); navigate("/setup"); },
  });

  const strava = (data as any)?.stravaSummary;
  const components = (data as any)?.components ?? [];
  const quote = MOTIVATION.find((q) => strava && q.condition(strava));

  if (!data) return (
    <div style={{ ...s.screen, justifyContent: "center", color: "#64748b", fontFamily: "sans-serif" }}>
      Loading…
    </div>
  );

  return (
    <div style={s.screen}>
      <div style={{ maxWidth: "min(700px, 95vw)", width: "100%" }}>
        <div style={s.dashHeader}>
          <div>
            <h1 style={{ color: "#f97316", fontSize: 26, margin: 0, fontWeight: 900 }}>🚵 BikeHealth</h1>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Component Health Report</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => resetBikeMutation.mutate()} style={s.resetBtn} disabled={!resolvedBikeId}>
              Re-setup Bike
            </button>
            <button onClick={() => disconnectMutation.mutate()} style={s.resetBtn}>
              Disconnect Strava
            </button>
          </div>
        </div>

        <div style={s.disclaimer}>
          ⚠️ These results are estimates only. Component failures can occur independently of wear calculations. If in doubt, visit your local shop for a professional inspection.
        </div>

        {strava && (
          <div style={s.statsRow}>
            {[
              { val: Math.round(strava.totalKm).toLocaleString() + " km", label: "Total Distance 🛣️" },
              { val: strava.totalClimbM.toLocaleString() + "m", label: "Total Climbing ⛰️" },
            ].map((stat) => (
              <div key={stat.label} style={s.statCard}>
                <div style={s.statValue}>{stat.val}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={s.compGrid}>
          {components.map((comp: any) => {
            const meta = COMPONENT_META.find((m) => m.id === comp.type)!;
            return (
              <div key={comp.id} style={{ ...s.compCard, borderColor: getHealthColor(comp.healthPercent) + "44" }}>
                <DonutChart percent={comp.healthPercent} icon={meta.icon} label={meta.name} />
                <div style={{ marginTop: 8, textAlign: "center" }}>
                  {comp.healthPercent >= 70
                    ? <span style={{ color: "#22c55e", fontSize: 18 }}>👍</span>
                    : comp.healthPercent >= 40
                    ? <span style={{ fontSize: 18 }}>⚠️</span>
                    : <span style={{ color: "#ef4444", fontSize: 18 }}>👎</span>}
                </div>
                {comp.healthPercent < 70 && (
                  <p style={{ color: "#94a3b8", fontSize: 10, textAlign: "center", margin: "6px 0 0", lineHeight: 1.4 }}>
                    {comp.healthPercent < 40 ? "We recommend a shop visit soon" : "Still OK — ride safe out there"}
                  </p>
                )}
                <button onClick={() => setUpdateModal({ ...comp, meta })} style={s.updateBtn}>
                  Update Component
                </button>
              </div>
            );
          })}
        </div>

        {quote && (
          <div style={s.motivationCard}>
            <p style={{ margin: 0, fontSize: 14, color: "#e2e8f0", lineHeight: 1.6 }}>{quote.text}</p>
          </div>
        )}
      </div>

      {updateModal && (
        <UpdateModal
          comp={updateModal}
          onClose={() => setUpdateModal(null)}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            setUpdateModal(null);
          }}
        />
      )}
    </div>
  );
}
