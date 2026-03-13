import { apiFetch } from "./client";

export interface CreateBikePayload {
  brand: string;
  model?: string;
  purchaseYear?: number;
  purchaseMonth?: number;
  components?: Record<string, { purchaseDate: string; brand?: string }>;
}

export const bikesApi = {
  list: () => apiFetch<any[]>("api/bikes"),
  create: (data: CreateBikePayload) =>
    apiFetch<any>("api/bikes", { method: "POST", body: JSON.stringify(data) }),
  getComponents: (bikeId: string) => apiFetch<any>(`api/bikes/${bikeId}/components`),
  deleteBike: (bikeId: string) =>
    apiFetch<any>(`api/bikes/${bikeId}`, { method: "DELETE" }),
  updateComponent: (componentId: string, data: { purchaseDate?: string; brand?: string }) =>
    apiFetch<any>(`api/components/${componentId}`, { method: "PATCH", body: JSON.stringify(data) }),
};
