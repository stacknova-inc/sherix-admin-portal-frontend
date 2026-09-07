"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { companiesApi, type CompanyStatusAction, type CompanyVerificationAction } from "@/services/companies";
import { recordId } from "@/lib/live-data";
import type { Company } from "@/types";

export const companiesQueryKey = ["companies"] as const;
export function useCompanies() { return useQuery({ queryKey: companiesQueryKey, queryFn: companiesApi.list }); }

function mergeCompany(queryClient: QueryClient, companyId: string, updated: Company) {
  if (!updated || typeof updated !== "object") return;
  queryClient.setQueryData<Company[]>(companiesQueryKey, (old) =>
    old?.map((company) =>
      recordId(company) === companyId || String(company.companyId ?? "") === companyId
        ? { ...company, ...updated }
        : company,
    ),
  );
}

export function useCompanyVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, action, reason, idempotencyKey }: { companyId: string; action: CompanyVerificationAction; reason?: string; idempotencyKey?: string }) =>
      companiesApi.verification(companyId, action, reason ? { reason } : undefined, idempotencyKey),
    onSuccess: (updated, { companyId }) => mergeCompany(queryClient, companyId, updated),
    onSettled: () => queryClient.invalidateQueries({ queryKey: companiesQueryKey }),
  });
}
export function useCompanyStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, action, reason, idempotencyKey }: { companyId: string; action: CompanyStatusAction; reason?: string; idempotencyKey?: string }) =>
      companiesApi.status(companyId, action, reason ? { reason } : undefined, idempotencyKey),
    onSuccess: (updated, { companyId }) => mergeCompany(queryClient, companyId, updated),
    onSettled: () => queryClient.invalidateQueries({ queryKey: companiesQueryKey }),
  });
}
