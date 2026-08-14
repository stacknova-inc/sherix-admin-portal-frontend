"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companiesApi, type CompanyStatusAction, type CompanyVerificationAction } from "@/services/companies";

export const companiesQueryKey = ["companies"] as const;
export function useCompanies() { return useQuery({ queryKey: companiesQueryKey, queryFn: companiesApi.list }); }
export function useCompanyVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, action, reason }: { companyId: string; action: CompanyVerificationAction; reason?: string }) =>
      companiesApi.verification(companyId, action, reason ? { reason } : undefined),
    onSettled: () => queryClient.invalidateQueries({ queryKey: companiesQueryKey }),
  });
}
export function useCompanyStatus() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ companyId, action, reason }: { companyId: string; action: CompanyStatusAction; reason?: string }) => companiesApi.status(companyId, action, reason ? { reason } : undefined), onSettled: () => queryClient.invalidateQueries({ queryKey: companiesQueryKey }) });
}
