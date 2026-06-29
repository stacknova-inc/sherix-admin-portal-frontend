"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/dashboard";
import { useUiStore } from "@/store/use-ui-store";

export function useDashboardSummary() {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardApi.summary,
    enabled: Boolean(token),
  });
}

export function useDashboardAnalytics(range = "30D") {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["dashboard", "analytics", range],
    queryFn: () => dashboardApi.analytics(range),
    enabled: Boolean(token),
  });
}
