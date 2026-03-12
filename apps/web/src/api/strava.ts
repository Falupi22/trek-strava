import { apiFetch } from "./client";

export const stravaApi = {
  getSummary: () => apiFetch<{ totalKm: number; totalClimbM: number; totalDescentM: number; lastSyncedAt: string | null; synced: boolean }>("api/strava/summary"),
  sync: () => apiFetch<{ message: string }>("api/strava/sync", { method: "POST" }),
};
