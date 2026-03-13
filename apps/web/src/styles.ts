import type { CSSProperties } from "react";

type Styles = Record<string, CSSProperties>;

export const s: Styles = {
  screen: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0f1e 0%, #0f172a 60%, #0a0f1e 100%)",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "flex-start", padding: "clamp(16px, 5vw, 32px) clamp(8px, 3vw, 16px)",
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
  },
  card: {
    background: "rgba(15,23,42,0.95)", border: "1px solid #1e293b",
    borderRadius: 20, padding: "clamp(20px, 8vw, 40px)", width: "100%", maxWidth: "min(480px, 90vw)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
  },
  title: { color: "#f97316", fontSize: "clamp(24px, 8vw, 34px)", fontWeight: 900, margin: "0 0 6px", letterSpacing: -1 },
  subtitle: { color: "#64748b", fontSize: "clamp(13px, 4vw, 15px)", margin: 0 },
  privacyBox: {
    background: "rgba(30,41,59,0.6)", border: "1px solid #334155",
    borderRadius: 12, padding: 16, marginBottom: 24,
  },
  stravaBtn: {
    width: "100%", padding: "clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)",
    background: "linear-gradient(135deg, #fc4c02, #e03e00)",
    color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 12, boxShadow: "0 4px 20px rgba(252,76,2,0.4)",
  },
  section: { marginBottom: 20 },
  label: { display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 10, fontWeight: 600 },
  select: {
    width: "100%", padding: "10px 14px", background: "#0f172a",
    border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0",
    fontSize: 14, cursor: "pointer", outline: "none",
  },
  optionBtn: {
    flex: 1, padding: "10px 16px", background: "transparent",
    border: "1px solid #334155", borderRadius: 10, color: "#94a3b8",
    fontSize: 14, cursor: "pointer",
  },
  optionBtnActive: {
    background: "rgba(249,115,22,0.15)", border: "1px solid #f97316",
    color: "#f97316", fontWeight: 700,
  },
  primaryBtn: {
    width: "100%", padding: "clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
    cursor: "pointer",
  },
  progressBar: { width: "clamp(200px, 70vw, 280px)", height: 4, background: "#1e293b", borderRadius: 999, margin: "28px auto 0", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #f97316, #fbbf24)", borderRadius: 999, animation: "progress 3s linear forwards", width: "0%" },
  dashHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  resetBtn: { padding: "8px 16px", background: "transparent", border: "1px solid #334155", borderRadius: 8, color: "#64748b", fontSize: 13, cursor: "pointer" },
  disclaimer: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 12, lineHeight: 1.6, marginBottom: 20 },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 16,
    width: "100%",
  },
  statCard: { background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 12px", textAlign: "center" },
  statValue: { color: "#f97316", fontSize: 20, fontWeight: 800, marginBottom: 4 },
  statLabel: { color: "#64748b", fontSize: 11 },
  compGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 24,
    width: "100%",
  },
  compCard: { background: "rgba(15,23,42,0.9)", border: "1px solid", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", alignItems: "center" },
  updateBtn: { marginTop: 12, padding: "5px 12px", background: "transparent", border: "1px solid #334155", borderRadius: 8, color: "#64748b", fontSize: 11, cursor: "pointer" },
  motivationCard: { background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,191,36,0.05))", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 16, padding: "clamp(12px, 4vw, 18px) clamp(16px, 5vw, 24px)", textAlign: "center" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "clamp(8px, 3vw, 16px)" },
  modal: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "clamp(16px, 6vw, 32px)", width: "100%", maxWidth: "min(400px, 90vw)", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" },
};
