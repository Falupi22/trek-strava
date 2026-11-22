import { apiFetch } from "./client";

export interface StravaBike {
  id: string;
  name: string;
  primary: boolean;
  km: number;
  retired: boolean;
}

export const stravaApi = {
  getSummary: () =>
    apiFetch<{
      totalKm: number;
      totalClimbM: number;
      totalDescentM: number;
      activityCount: number;
      lastSyncedAt: string | null;
      synced: boolean;
    }>("api/strava/summary"),
  sync: () =>
    apiFetch<{ message: string }>("api/strava/sync", { method: "POST" }),
  /** The athlete's bikes in Strava. Calls Strava, so cache it client-side. */
  getGear: () =>
    apiFetch<{ bikes: StravaBike[]; needsReconnect: boolean }>("api/strava/gear"),
};
