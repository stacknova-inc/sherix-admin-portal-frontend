"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { individualMechanicsApi, companyMechanicsApi, type MechanicAction } from "@/services/mechanics";

// ── Individual Mechanics ──────────────────────────────────────────────────────

export const individualMechanicsQueryKey = ["service-providers", "individual"] as const;

export function useIndividualMechanics() {
  return useQuery({
    queryKey: individualMechanicsQueryKey,
    queryFn: individualMechanicsApi.list,
  });
}

export function useIndividualMechanicStats() {
  return useQuery({
    queryKey: [...individualMechanicsQueryKey, "stats"],
    queryFn: individualMechanicsApi.stats,
  });
}

export function useIndividualMechanicAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: MechanicAction; reason?: string }) =>
      individualMechanicsApi.action(id, action, reason ? { reason } : undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: individualMechanicsQueryKey }),
  });
}

// ── Company Mechanics ─────────────────────────────────────────────────────────

export const companyMechanicsQueryKey = ["service-providers", "company"] as const;

export function useCompanyMechanics() {
  return useQuery({
    queryKey: companyMechanicsQueryKey,
    queryFn: companyMechanicsApi.list,
  });
}

export function useCompanyMechanicStats() {
  return useQuery({
    queryKey: [...companyMechanicsQueryKey, "stats"],
    queryFn: companyMechanicsApi.stats,
  });
}

export function useCompanyMechanicAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: MechanicAction; reason?: string }) =>
      companyMechanicsApi.action(id, action, reason ? { reason } : undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyMechanicsQueryKey }),
  });
}