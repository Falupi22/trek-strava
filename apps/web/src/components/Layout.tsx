import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import StravaAttribution from "./StravaAttribution";
import { useI18n } from "../i18n";

interface Props {
  children: ReactNode;
  /** Buttons shown on the right of the top bar. */
  actions?: ReactNode;
  /** Constrain the content column (forms, long-form text). */
  narrow?: boolean;
}

export default function Layout({ children, actions, narrow }: Props) {
  const { t, lang, setLang } = useI18n();

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand">
            <img src="/ctc.png" alt="CTC" />
            <span className="brand-name">CTC Bike Health</span>
            <span className="pill pill-beta" title={t.common.betaTitle}>
              {t.common.beta}
            </span>
          </Link>
          <div className="topbar-actions">
            {actions}
            <button
              className="btn btn-ghost btn-sm lang-switch"
              onClick={() => setLang(lang === "he" ? "en" : "he")}
              aria-label={t.common.switchLangAria}
              lang={lang === "he" ? "en" : "he"}
            >
              {t.common.switchLang}
            </button>
          </div>
        </div>
      </header>

      <main className={`main container${narrow ? " container-narrow" : ""}`}>
        {children}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <nav className="footer-links">
            <Link to="/privacy">{t.common.privacy}</Link>
            <Link to="/terms">{t.common.terms}</Link>
            <a href="https://ctc.co.il" target="_blank" rel="noopener noreferrer">
              {t.common.support}
            </a>
          </nav>
          <StravaAttribution />
        </div>
      </footer>
    </div>
  );
}
