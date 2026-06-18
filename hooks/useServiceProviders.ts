"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceProvidersApi, type ServiceProviderAction } from "@/services/service-providers";

export const serviceProvidersQueryKey = ["service-providers"] as const;
export const individualProvidersQueryKey = [...serviceProvidersQueryKey, "individual"] as const;
export const companyProvidersQueryKey = [...serviceProvidersQueryKey, "company"] as const;

export function useServiceProviders() {
  return useQuery({
    queryKey: serviceProvidersQueryKey,
    queryFn: () => serviceProvidersApi.list(),
  });
}

export function useIndividualProviders() {
  const query = useQuery({
    queryKey: individualProvidersQueryKey,
    queryFn: () => serviceProvidersApi.list(true),
  });

  const data = useMemo(() => (query.data ?? []).filter((provider) => provider.isEmployee === true), [query.data]);
  return { ...query, data };
}

export function useCompanyProviders() {
  const query = useQuery({
    queryKey: companyProvidersQueryKey,
    queryFn: () => serviceProvidersApi.list(false),
  });

  const data = useMemo(() => (query.data ?? []).filter((provider) => provider.isEmployee === false), [query.data]);
  return { ...query, data };
}

export function useServiceProviderAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: ServiceProviderAction; reason?: string }) =>
      serviceProvidersApi.action(id, action, reason ? { reason } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceProvidersQueryKey });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
