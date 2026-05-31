"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/dashboard";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardApi.summary,
  });
}

export function useDashboardAnalytics(range = "30D") {
  return useQuery({
    queryKey: ["dashboard", "analytics", range],
    queryFn: () => dashboardApi.analytics(range),
  });
}
