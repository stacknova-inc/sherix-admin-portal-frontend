"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/services/audit";
import { useUiStore } from "@/store/use-ui-store";

export function useAuditLogs(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["audit", "logs", params],
    queryFn: () => auditApi.list(params),
  });
}

export function useAuditStats() {
  const token = useUiStore((state) => state.token);
  return useQuery({
    queryKey: ["audit", "stats"],
    queryFn: auditApi.stats,
    enabled: Boolean(token),
  });
}
