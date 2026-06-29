"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companiesApi, type CompanyAction } from "@/services/companies";
import { companyProvidersQueryKey, serviceProvidersQueryKey } from "@/hooks/useServiceProviders";
import { useUiStore } from "@/store/use-ui-store";

export const companiesQueryKey = companyProvidersQueryKey;

export function useCompanies() {
  return useQuery({
    queryKey: companiesQueryKey,

    queryFn: companiesApi.list,
  });
}

export function useCompanyStats() {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["companies", "stats"],
    queryFn: companiesApi.stats,
    enabled: Boolean(token),
  });
}

export function useCompanyAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: CompanyAction; reason?: string }) =>
      companiesApi.action(id, action, reason ? { reason } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companiesQueryKey });
      queryClient.invalidateQueries({ queryKey: serviceProvidersQueryKey });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
