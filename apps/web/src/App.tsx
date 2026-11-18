import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";
import { bikesApi } from "./api/bikes";
import { stravaApi } from "./api/strava";
import ConnectPage from "./pages/ConnectPage";
import SetupPage from "./pages/SetupPage";
import ProcessingPage from "./pages/ProcessingPage";
import DashboardPage from "./pages/DashboardPage";
import CallbackPage from "./pages/CallbackPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

function HomeRedirect() {
  const { authed, loading } = useAuth();
  const { data: bikes, isLoading } = useQuery({
    queryKey: ["bikes"],
    queryFn: bikesApi.list,
    enabled: authed,
  });
  const hasBikes = !!bikes && bikes.length > 0;
  // A user returning after inactivity has had their Strava totals purged
  // (retention policy); the server rebuilds them on return. Show the
  // processing screen meanwhile instead of a dashboard full of zeros.
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["strava-summary"],
    queryFn: stravaApi.getSummary,
    enabled: authed && hasBikes,
  });

  if (loading) return null;
  if (!authed) return <ConnectPage />;
  if (isLoading) return null;
  if (!hasBikes) return <Navigate to="/setup" />;
  if (summaryLoading) return null;
  return <Navigate to={summary?.synced ? "/dashboard" : "/processing"} />;
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { authed, loading } = useAuth();
  if (loading) return null;
  return authed ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <>
      {/* Beta status is shown as a pill in the top bar (see Layout). */}
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
