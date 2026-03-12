import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { s } from "../styles";

export default function ConnectPage() {
  const [agreed, setAgreed] = useState(false);
  const [params] = useSearchParams();
  const error = params.get("error");

  const handleConnect = () => {
    window.location.href = "/auth/strava";
  };

  return (
    <div style={s.screen}>
      <div style={s.card}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🚵</div>
          <h1 style={s.title}>BikeHealth</h1>
          <p style={s.subtitle}>Bike Component Health Management</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13, marginBottom: 20 }}>
            Connection failed. Please try again.
          </div>
        )}

        <div style={s.privacyBox}>
          <div style={{ fontSize: 15, marginBottom: 10, color: "#e2e8f0", fontWeight: 600 }}>🔒 Privacy Statement</div>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 14px" }}>
            Data received from Strava will be used for <strong style={{ color: "#e2e8f0" }}>personal analysis only</strong>. Your information will not be shared with others, used to train models, or stored beyond what is needed for this service.
          </p>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#94a3b8", fontSize: 13 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: "#f97316" }}
            />
            I understand and agree to the privacy terms
          </label>
        </div>

        <button
          onClick={handleConnect}
          disabled={!agreed}
          style={{ ...s.stravaBtn, opacity: agreed ? 1 : 0.4, cursor: agreed ? "pointer" : "not-allowed" }}
        >
          <span style={{ fontSize: 20 }}>🔗</span>
          <span>Connect with Strava</span>
        </button>
      </div>
    </div>
  );
}
