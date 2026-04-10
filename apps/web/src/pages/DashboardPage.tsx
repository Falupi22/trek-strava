import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { COMPONENT_META, getHealthColor } from "@bikehealth/shared";
import { bikesApi } from "../api/bikes";
import { useAuthStore } from "../stores/authStore";
import { apiFetch } from "../api/client";
import DonutChart from "../components/DonutChart";
import UpdateModal from "../components/UpdateModal";
import StravaAttribution from "../components/StravaAttribution";
import { s, theme } from "../styles";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { text: "Burning the midnight oil", emoji: "🌙" };
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (h < 21) return { text: "Good evening", emoji: "🌇" };
  return       { text: "Good night", emoji: "🌙" };
}

const MOTIVATION = [
  {
    condition: (d: any) => d.totalKm > 5000,
    text: "We thought our system crashed from all those kilometers you've been grinding. Got a trail coming up soon? 🚵",
  },
  {
    condition: (d: any) => d.totalClimbM > 5000,
    text: "How about some flat ground? Your bike does nothing but climb all day — it's not like we've got Everest around here ⛰️",
  },
  {
    condition: () => true,
    text: "Your bike is doing incredible work out there! The wrench is proud of you 🤘",
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const clearToken = useAuthStore((s) => s.clearToken);
  const queryClient = useQueryClient();
  const [updateModal, setUpdateModal] = useState<any>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [bikeId, setBikeId] = useState<string | null>(null);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("auth/me"),
  });

  const { data: bikes } = useQuery({
    queryKey: ["bikes"],
    queryFn: bikesApi.list,
    onSuccess: (data: any[]) => {
      if (data[0]) setBikeId(data[0].id);
    },
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
    onSuccess: () => {
      clearToken();
      navigate("/");
    },
  });

  const resetBikeMutation = useMutation({
    mutationFn: () => bikesApi.deleteBike(resolvedBikeId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      navigate("/setup");
    },
  });

  const greeting = getGreeting();
  const strava = (data as any)?.stravaSummary;
  const components = (data as any)?.components ?? [];
  const quote = MOTIVATION.find((q) => strava && q.condition(strava));

  if (!data)
    return (
      <div
        style={{
          ...s.screen,
          justifyContent: "center",
          color: theme.muted,
        }}
      >
        <div style={s.spinner}></div>
        This might take a few moments...
      </div>
    );

  return (
    <>
      <div style={s.screen}>
        <div style={{ maxWidth: "min(700px, 95vw)", width: "100%" }}>
          {/* Header */}
          <div
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: "28px 32px",
              marginBottom: 24,
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            }}
          >
            {/* Greeting row */}
            <p style={{ margin: "0 0 14px", fontSize: 13, color: theme.muted, fontWeight: 500 }}>
              {greeting.emoji}&nbsp; {greeting.text}{(me as any)?.displayName ? `, ${(me as any).displayName}` : ""}
            </p>

            {/* Title + buttons row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <h1 style={{ color: theme.dark, fontSize: 24, margin: 0, fontWeight: 700, letterSpacing: -0.5 }}>
                  CTC Bike Health
                </h1>
                <p style={{ color: theme.muted, fontSize: 12, margin: "5px 0 0", letterSpacing: 0.2 }}>
                  Component Health Report
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => resetBikeMutation.mutate()}
                  style={s.resetBtn}
                  disabled={!resolvedBikeId}
                >
                  Re-setup Bike
                </button>
                <button
                  onClick={() => setShowDisconnectConfirm(true)}
                  style={s.resetBtn}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          <div style={s.disclaimer}>
            ⚠️ These results are estimates only. Component failures can occur
            independently of wear calculations. If in doubt, visit your local
            shop for a professional inspection.
          </div>

          {strava && (
            <div style={s.statsRow}>
              {[
                {
                  val: Math.round(strava.totalKm).toLocaleString() + " km",
                  label: "Total Distance 🛣️",
                },
                {
                  val: strava.totalClimbM.toLocaleString() + "m",
                  label: "Total Climbing ⛰️",
                },
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
                <div
                  key={comp.id}
                  style={{
                    ...s.compCard,
                    borderColor: getHealthColor(comp.healthPercent) + "44",
                  }}
                >
                  <DonutChart
                    percent={comp.healthPercent}
                    icon={meta.icon}
                    label={meta.name}
                  />
                  <div style={{ marginTop: 8, textAlign: "center" }}>
                    {comp.healthPercent >= 70 ? (
                      <span style={{ color: "#22c55e", fontSize: 18 }}>👍</span>
                    ) : comp.healthPercent >= 40 ? (
                      <span style={{ fontSize: 18 }}>⚠️</span>
                    ) : (
                      <span style={{ color: "#ef4444", fontSize: 18 }}>👎</span>
                    )}
                  </div>
                  {comp.healthPercent < 70 && (
                    <p
                      style={{
                        color: theme.muted,
                        fontSize: 10,
                        textAlign: "center",
                        margin: "6px 0 0",
                        lineHeight: 1.4,
                      }}
                    >
                      {comp.healthPercent < 40
                        ? "We recommend a shop visit soon"
                        : "Still OK — ride safe out there"}
                    </p>
                  )}
                  <button
                    onClick={() => setUpdateModal({ ...comp, meta })}
                    style={s.updateBtn}
                  >
                    Update Component
                  </button>
                </div>
              );
            })}
          </div>

          {quote && (
            <div style={s.motivationCard}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: theme.mid,
                  lineHeight: 1.6,
                }}
              >
                {quote.text}
              </p>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 32, paddingBottom: 24 }}>
          {(me as any)?.stravaAthleteId && (
            <a
              href={`https://www.strava.com/athletes/${(me as any).stravaAthleteId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                color: "#FC5200",
                fontSize: 12,
                marginBottom: 20,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              View on Strava →
            </a>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <a
              href="/privacy"
              style={{
                color: theme.muted,
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              style={{
                color: theme.muted,
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              Terms of Service
            </a>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <StravaAttribution />
        </div>
      </div>

      {showDisconnectConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              maxWidth: 420,
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h2 style={{ margin: "0 0 12px", color: theme.dark, fontSize: 18 }}>
              Disconnect Strava?
            </h2>
            <p style={{ color: theme.mid, fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
              As required by the{" "}
              <a
                href="https://www.strava.com/legal/api"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.dark, textDecoration: "underline" }}
              >
                Strava API Agreement
              </a>
              , disconnecting will permanently delete all your data from our
              systems within 48 hours — including your profile, activity
              statistics, and bike configurations. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                style={{ ...s.resetBtn, opacity: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDisconnectConfirm(false);
                  disconnectMutation.mutate();
                }}
                style={{
                  ...s.resetBtn,
                  background: theme.red,
                  color: "#fff",
                  border: "none",
                  opacity: 1,
                }}
              >
                Yes, disconnect & delete my data
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
