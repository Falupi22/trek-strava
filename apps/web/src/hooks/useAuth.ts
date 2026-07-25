import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";

export interface Me {
  id: string;
  stravaAthleteId: string;
  displayName: string;
  profileImageUrl: string | null;
  stravaConnected: boolean;
}

// Auth state is derived from the httpOnly session cookie via /auth/me — the
// token itself is never readable by JS. A 401 resolves to "not authed".
export function useAuth() {
  const { data, isLoading, isSuccess } = useQuery<Me>({
    queryKey: ["me"],
    queryFn: () => apiFetch<Me>("auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  return { me: data, authed: isSuccess, loading: isLoading };
}