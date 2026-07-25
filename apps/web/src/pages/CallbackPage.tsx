import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function CallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // The session cookie was set by the OAuth callback redirect. Refresh the
    // cached auth state and send the user into the app.
    queryClient.invalidateQueries({ queryKey: ["me"] });
    navigate("/");
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", color: "#555555", fontFamily: "'Open Sans', sans-serif" }}>
      Connecting…
    </div>
  );
}