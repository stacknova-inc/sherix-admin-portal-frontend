"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi, type AuditLogListParams } from "@/services/audit";
import { useUiStore } from "@/store/use-ui-store";

export function useAuditLogs(params?: AuditLogListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["audit", "logs", params],
    queryFn: () => auditApi.list(params),
    enabled: options?.enabled ?? true,
  });
}

export function useAuditStats() {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["audit", "stats"],
    queryFn: auditApi.stats,
    enabled: Boolean(token),
  });
}
