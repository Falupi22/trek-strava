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
      navigate("/");
    } else {
      navigate(`/?error=${error ?? "unknown"}`);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", color: "#555555", fontFamily: "'Open Sans', sans-serif" }}>
      Connecting…
    </div>
  );
}
