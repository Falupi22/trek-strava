import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function CallbackPage() {
  const [params] = useSearchParams();
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");
    if (token) {
      setToken(token);
      navigate("/setup");
    } else {
      navigate(`/?error=${error ?? "unknown"}`);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0f1e", color: "#e2e8f0", fontFamily: "sans-serif" }}>
      Connecting…
    </div>
  );
}
