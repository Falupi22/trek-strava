import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { stravaApi } from "../api/strava";
import Layout from "../components/Layout";

import { useI18n } from "../i18n";

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const MESSAGES = t.processing.messages;
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

  // Safety net: if the sync fails (e.g. Strava rejects the token), don't
  // leave the user on a spinner forever. The dashboard keeps polling.
  useEffect(() => {
    const t = setTimeout(() => navigate("/dashboard"), 90_000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const m = setInterval(
      () => setMsgIdx((p) => (p + 1) % MESSAGES.length),
      900,
    );
    return () => clearInterval(m);
  }, []);

  return (
    <Layout narrow>
      <div className="center-screen">
        <div className="card fade-in" style={{ width: "100%" }}>
          <div className="spinner" />
          <h1 className="section-title" style={{ fontSize: 22 }}>
            {t.processing.title}
          </h1>
          <p className="page-subtitle" role="status">
            {MESSAGES[msgIdx]}
          </p>
          <div className="progress">
            <div />
          </div>
        </div>
      </div>
    </Layout>
  );
}
