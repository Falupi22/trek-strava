import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";
import { bikesApi } from "./api/bikes";
import ConnectPage from "./pages/ConnectPage";
import SetupPage from "./pages/SetupPage";
import ProcessingPage from "./pages/ProcessingPage";
import DashboardPage from "./pages/DashboardPage";
import CallbackPage from "./pages/CallbackPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes progress { from { width: 0%; } to { width: 100%; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f5f5f5; font-family: 'Open Sans', 'Segoe UI', Arial, sans-serif; color: #363636; }
  select option { background: #ffffff; color: #363636; }
  button:hover { opacity: 0.88; transition: opacity 0.15s; }
`;

function HomeRedirect() {
  const { authed, loading } = useAuth();
  const { data: bikes, isLoading } = useQuery({
    queryKey: ["bikes"],
    queryFn: bikesApi.list,
    enabled: authed,
  });

  if (loading) return null;
  if (!authed) return <ConnectPage />;
  if (isLoading) return null;
  return <Navigate to={bikes && bikes.length > 0 ? "/dashboard" : "/setup"} />;
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { authed, loading } = useAuth();
  if (loading) return null;
  return authed ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <>
      <style>{globalStyle}</style>
      <div
        style={{
          background: "#FFF8E1",
          borderBottom: "1px solid #FFE082",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 13,
          color: "#8D6E00",
        }}
      >
        <span style={{ fontWeight: 700 }}>BETA</span>
        <span>This app is in beta — features may change and bugs may occur.</span>
      </div>
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/setup"
          element={<RequireAuth><SetupPage /></RequireAuth>}
        />
        <Route
          path="/processing"
          element={<RequireAuth><ProcessingPage /></RequireAuth>}
        />
        <Route
          path="/dashboard"
          element={<RequireAuth><DashboardPage /></RequireAuth>}
        />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </>
  );
}
