"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companiesApi, type CompanyAction } from "@/services/companies";

export const companiesQueryKey = ["companies"] as const;

export function useCompanies() {
  return useQuery({
    queryKey: companiesQueryKey,
    queryFn: companiesApi.list,
  });
}

export function useCompanyStats() {
  return useQuery({
    queryKey: ["companies", "stats"],
    queryFn: companiesApi.stats,
  });
}

export function useCompanyAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: CompanyAction; reason?: string }) =>
      companiesApi.action(id, action, reason ? { reason } : undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companiesQueryKey }),
  });
}
