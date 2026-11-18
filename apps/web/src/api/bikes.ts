import { apiFetch } from "./client";

export interface RideTotals {
  totalKm: number;
  totalClimbM: number;
  totalDescentM: number;
  activityCount: number;
}

export interface BikeFields {
  brand: string;
  model?: string | null;
  purchaseYear?: number | null;
  purchaseMonth?: number | null;
  stravaGearId?: string | null;
  stravaGearName?: string | null;
}

export interface Bike extends Required<BikeFields> {
  id: string;
  model: string | null;
  isDefault: boolean;
}

export interface BikeWithStats extends Bike {
  /** Rides counted for this bike: from its purchase month on. */
  stats: RideTotals;
  /** Rides on its linked Strava bike before the purchase month — not counted. */
  beforePurchase: RideTotals | null;
  health: { Good: number; Fair: number; Replace: number };
}

export interface CreateBikePayload extends BikeFields {
  isDefault?: boolean;
  components?: Record<string, { purchaseDate: string; brand?: string }>;
}

export const bikesApi = {
  list: () => apiFetch<BikeWithStats[]>("api/bikes"),
  create: (data: CreateBikePayload) =>
    apiFetch<Bike>("api/bikes", { method: "POST", body: JSON.stringify(data) }),
  update: (bikeId: string, data: Partial<BikeFields>) =>
    apiFetch<Bike>(`api/bikes/${bikeId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  setDefault: (bikeId: string) =>
    apiFetch<{ success: true }>(`api/bikes/${bikeId}/default`, { method: "POST" }),
  getComponents: (bikeId: string) => apiFetch<any>(`api/bikes/${bikeId}/components`),
  deleteBike: (bikeId: string) =>
    apiFetch<any>(`api/bikes/${bikeId}`, { method: "DELETE" }),
  updateComponent: (componentId: string, data: { purchaseDate?: string; brand?: string }) =>
    apiFetch<any>(`api/components/${componentId}`, { method: "PATCH", body: JSON.stringify(data) }),
};
