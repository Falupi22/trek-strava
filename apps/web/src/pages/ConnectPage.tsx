import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import StravaAttribution from "../components/StravaAttribution";
import { s, theme } from "../styles";

export default function ConnectPage() {
  const [agreed, setAgreed] = useState(false);
  const [params] = useSearchParams();
  const error = params.get("error");

  const handleConnect = () => {
    window.location.href = "/auth/strava";
  };

  return (
    <>
      <div style={s.screen}>
        <div style={s.card}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <img src="/ctc.png" alt="CTC" style={{ height: 120 }} />
            <h1 style={s.title}>CTC Bike Health</h1>
            <p style={s.subtitle}>Bike Component Health Management</p>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(237,27,36,0.07)",
                border: `1px solid ${theme.red}`,
                borderRadius: 8,
                padding: "10px 14px",
                color: theme.dark,
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              Connection failed. Please try again.
            </div>
          )}

          <div style={s.privacyBox}>
            <div
              style={{
                fontSize: 14,
                marginBottom: 10,
                color: theme.dark,
                fontWeight: 600,
              }}
            >
              🔒 Privacy Statement
            </div>
            <p
              style={{
                fontSize: 13,
                color: theme.mid,
                lineHeight: 1.7,
                margin: "0 0 14px",
              }}
            >
              Data received from Strava will be used for{" "}
              <strong style={{ color: theme.dark }}>
                personal analysis only
              </strong>
              . Your information will not be shared with others, used to train
              models, or stored beyond what is needed for this service.
            </p>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                color: theme.mid,
                fontSize: 13,
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: theme.red }}
              />
              I understand and agree to the{" "}
              <a
                href="https://www.strava.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.dark, textDecoration: "underline" }}
              >
                privacy policy
              </a>{" "}
              and{" "}
              <a
                href="https://www.strava.com/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.dark, textDecoration: "underline" }}
              >
                terms of service
              </a>
            </label>
          </div>

          <button
            onClick={handleConnect}
            disabled={!agreed}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: agreed ? "pointer" : "not-allowed",
              opacity: agreed ? 1 : 0.4,
              display: "block",
              margin: "0 auto",
            }}
          >
            <img
              src="/btn_strava_connect_with_orange.png"
              alt="Connect with Strava"
              style={{ height: 48, display: "block" }}
            />
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <StravaAttribution />
        </div>
      </div>
    </>
  );
}
