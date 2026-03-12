import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import ConnectPage from "./pages/ConnectPage";
import SetupPage from "./pages/SetupPage";
import ProcessingPage from "./pages/ProcessingPage";
import DashboardPage from "./pages/DashboardPage";
import CallbackPage from "./pages/CallbackPage";

const globalStyle = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes progress { from { width: 0%; } to { width: 100%; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0a0f1e; }
  select option { background: #0f172a; }
`;

export default function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <>
      <style>{globalStyle}</style>
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/" element={!token ? <ConnectPage /> : <Navigate to="/setup" />} />
        <Route path="/setup" element={token ? <SetupPage /> : <Navigate to="/" />} />
        <Route path="/processing" element={token ? <ProcessingPage /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={token ? <DashboardPage /> : <Navigate to="/" />} />
      </Routes>
    </>
  );
}
