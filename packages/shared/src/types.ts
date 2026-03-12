export type ComponentType =
  | "chain"
  | "crank"
  | "rear_derailleur"
  | "front_brake"
  | "rear_brake"
  | "bearings";

export type HealthLabel = "Good" | "Fair" | "Replace";

export interface ComponentMeta {
  id: ComponentType;
  name: string;
  icon: string;
  wearFactors: Array<"km" | "climb" | "descent">;
  brands: string[];
}

export interface StravaSummary {
  totalKm: number;
  totalClimbM: number;
  totalDescentM: number;
  lastSyncedAt: string | null;
}

export interface HealthResult {
  healthPercent: number;
  healthLabel: HealthLabel;
  healthColor: string;
  wearBreakdown: {
    ageWear: number;
    kmWear: number;
    climbWear: number;
    descentWear: number;
  };
}

export interface BikeComponent {
  id: string;
  type: ComponentType;
  brand: string | null;
  purchaseDate: string; // ISO date string YYYY-MM-DD
  health: HealthResult;
}

export interface Bike {
  id: string;
  brand: string;
  model: string | null;
  purchaseYear: number | null;
  purchaseMonth: number | null;
}

export interface User {
  id: string;
  stravaAthleteId: number;
  displayName: string;
  profileImageUrl: string | null;
  stravaConnected: boolean;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  statusCode: number;
}
