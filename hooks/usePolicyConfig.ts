"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { policyConfigApi } from "@/services/policy-config";
import type { PolicyConfigUpdateInput } from "@/types";

export const policyConfigQueryKey = ["policy-config", "effective"] as const;
export const policyConfigHistoryQueryKey = ["policy-config", "history"] as const;

export function usePolicyConfig() {
  return useQuery({
    queryKey: policyConfigQueryKey,
    queryFn: policyConfigApi.getEffective,
  });
}

export function usePolicyConfigHistory() {
  return useQuery({
    queryKey: policyConfigHistoryQueryKey,
    queryFn: policyConfigApi.getHistory,
  });
}

export function useUpdatePolicyConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PolicyConfigUpdateInput) => policyConfigApi.update(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(policyConfigQueryKey, updated);
      queryClient.invalidateQueries({ queryKey: policyConfigQueryKey });
      queryClient.invalidateQueries({ queryKey: policyConfigHistoryQueryKey });
    },
  });
}
