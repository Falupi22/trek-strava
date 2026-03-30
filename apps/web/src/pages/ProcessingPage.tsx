import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { stravaApi } from "../api/strava";
import StravaAttribution from "../components/StravaAttribution";
import { s, theme } from "../styles";

const MESSAGES = [
  "Analyzing ride data…",
  "Checking component wear…",
  "Calculating health scores…",
  "Preparing your report…",
];

export default function ProcessingPage() {
  const navigate = useNavigate();
  const [dots, setDots] = useState(".");
  const [msgIdx, setMsgIdx] = useState(0);

  const { data } = useQuery({
    queryKey: ["strava-summary"],
    queryFn: stravaApi.getSummary,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (data?.synced) {
      setTimeout(() => navigate("/dashboard"), 800);
    }
  }, [data?.synced]);

  useEffect(() => {
    const d = setInterval(
      () => setDots((p) => (p.length >= 3 ? "." : p + ".")),
      400,
    );
    const m = setInterval(
      () => setMsgIdx((p) => (p + 1) % MESSAGES.length),
      700,
    );
    return () => {
      clearInterval(d);
      clearInterval(m);
    };
  }, []);

  return (
    <>
      <div style={{ ...s.screen, justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 72,
              marginBottom: 24,
              display: "inline-block",
              animation: "spin 2s linear infinite",
            }}
          >
            ⚙️
          </div>
          <h2
            style={{
              color: theme.dark,
              fontSize: 20,
              maxWidth: 360,
              margin: "0 auto 12px",
            }}
          >
            Hold tight — the wrench is diagnosing your patient{dots}
          </h2>
          <p style={{ color: theme.muted, fontSize: 15 }}>{MESSAGES[msgIdx]}</p>
          <div style={s.progressBar}>
            <div style={s.progressFill} />
          </div>
        </div>
      </div>

      <StravaAttribution />
    </>
  );
}
