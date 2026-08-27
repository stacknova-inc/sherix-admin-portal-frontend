"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceRequestsApi } from "@/services/service-requests";
import { useUiStore } from "@/store/use-ui-store";

export function useServiceRequests(params?: Record<string, string | number | undefined>) {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["serviceRequests", params],
    queryFn: () => serviceRequestsApi.list(params),
    enabled: Boolean(token),
  });
}

export function useServiceRequestStats() {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["serviceRequests", "stats"],
    queryFn: serviceRequestsApi.stats,
    enabled: Boolean(token),
  });
}
