import { useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useI18n } from "../i18n";

// Shown for any URL the app doesn't know (e.g. a mistyped or outdated link).
// nginx serves index.html for every path, so this is the app's 404 page.
export default function NotFoundPage() {
  const { t } = useI18n();
  const n = t.notFound;

  // Tell search engines this isn't a real page (the HTTP status is 200 for
  // every SPA route, so this is the next best signal).
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <Layout narrow>
      <div className="center-screen">
        <div className="card not-found fade-in">
          <p className="not-found-code" aria-hidden>
            {n.code}
          </p>
          <h1 className="page-title">{n.title}</h1>
          <p className="page-subtitle">{n.text}</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>
            {n.home}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
