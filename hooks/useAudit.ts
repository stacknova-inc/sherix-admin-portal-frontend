"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/services/audit";

export function useAuditLogs(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["audit", "logs", params],
    queryFn: () => auditApi.list(params),
  });
}

export function useAuditStats() {
  return useQuery({
    queryKey: ["audit", "stats"],
    queryFn: auditApi.stats,
  });
}
