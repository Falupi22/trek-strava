import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "./stores/authStore";
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
  const token = useAuthStore((s) => s.token);
  const { data: bikes, isLoading } = useQuery({
    queryKey: ["bikes"],
    queryFn: bikesApi.list,
    enabled: !!token,
  });

  if (!token) return <ConnectPage />;
  if (isLoading) return null;
  return <Navigate to={bikes && bikes.length > 0 ? "/dashboard" : "/setup"} />;
}

export default function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <>
      <style>{globalStyle}</style>
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/setup"
          element={token ? <SetupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/processing"
          element={token ? <ProcessingPage /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={token ? <DashboardPage /> : <Navigate to="/" />}
        />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </>
  );
}
