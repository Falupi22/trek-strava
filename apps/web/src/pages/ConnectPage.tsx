import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useI18n } from "../i18n";

export default function ConnectPage() {
  const { t } = useI18n();
  const c = t.connect;
  const [agreed, setAgreed] = useState(false);
  const [showConsentHint, setShowConsentHint] = useState(false);
  const [params] = useSearchParams();
  const error = params.get("error");

  // The official Strava button must be shown unmodified, so instead of
  // dimming it until consent is given we keep it as-is and prompt on click.
  const handleConnect = () => {
    if (!agreed) {
      setShowConsentHint(true);
      return;
    }
    window.location.href = "/auth/strava";
  };

  return (
    <Layout>
      <section className="hero">
        <div className="hero-intro fade-in">
          <h1 className="hero-title">
            {c.heroBefore}
            <em>{c.heroEm}</em>
          </h1>
          <p className="hero-lead">{c.heroLead}</p>
        </div>
        {/* Separate grid item so phones can place it below the connect card. */}
        <div className="hero-features fade-in">
          <ul className="features">
            {c.features.map((f) => (
              <li key={f.title}>
                <span className="feature-icon" aria-hidden>
                  {f.icon}
                </span>
                <span>
                  <strong>{f.title}</strong>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card connect-card fade-in">
          <h2>{c.getStarted}</h2>
          <p className="page-subtitle" style={{ marginTop: 0 }}>
            {c.connectSub}
          </p>

          {error && (
            <div className="notice notice-error" style={{ marginTop: 20 }}>
              <span className="notice-icon">⚠️</span>
              {error === "missing_scope" ? c.scopeError : c.connectError}
            </div>
          )}

          <div
            className="privacy-box"
            data-invalid={showConsentHint && !agreed}
          >
            <p>
              {c.consentBefore}
              <strong>{c.consentStrong}</strong>
              {c.consentAfter}
            </p>
            <label className="check">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (e.target.checked) setShowConsentHint(false);
                }}
              />
              <span>
                {c.agreeBefore}
                <Link to="/privacy">{c.agreePrivacy}</Link>
                {c.agreeAnd}
                <Link to="/terms">{c.agreeTerms}</Link>
              </span>
            </label>
          </div>

          {/* Official Strava asset; shown unmodified per the brand guidelines. */}
          <button
            className="strava-connect"
            onClick={handleConnect}
            aria-describedby="connect-hint"
          >
            <img
              src="/btn_strava_connect_with_orange.png"
              alt="Connect with Strava"
            />
          </button>
          <p id="connect-hint" className="connect-hint" role="status">
            {showConsentHint && !agreed ? c.consentHint : ""}
          </p>
        </div>
      </section>
    </Layout>
  );
}
