import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "../i18n";

export default function CallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  useEffect(() => {
    // The session cookie was set by the OAuth callback redirect. Refresh the
    // cached auth state and send the user into the app.
    queryClient.invalidateQueries({ queryKey: ["me"] });
    navigate("/");
  }, []);

  return (
    <div className="center-screen" style={{ minHeight: "100vh" }}>
      <div>
        <div className="spinner" />
        <p className="page-subtitle">{t.common.connecting}</p>
      </div>
    </div>
  );
}
