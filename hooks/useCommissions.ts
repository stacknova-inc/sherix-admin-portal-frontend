"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commissionsApi } from "@/services/commissions";
import type { BulkCommissionInput, CommissionInput } from "@/types";

export const commissionsQueryKey = ["commissions"] as const;

export function useCommissions() {
  return useQuery({
    queryKey: commissionsQueryKey,
    queryFn: commissionsApi.list,
  });
}

export function useCommission(id?: string) {
  return useQuery({
    queryKey: ["commissions", id],
    queryFn: () => commissionsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useEffectiveCommission(serviceId?: string) {
  return useQuery({
    queryKey: ["commissions", "service", serviceId],
    queryFn: () => commissionsApi.getEffectiveForService(serviceId as string),
    enabled: Boolean(serviceId),
  });
}

export function useCreateCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommissionInput) => commissionsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commissionsQueryKey }),
  });
}

export function useUpdateCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CommissionInput }) => commissionsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commissionsQueryKey }),
  });
}

export function useDeactivateCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commissionsApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commissionsQueryKey }),
  });
}

export function useBulkUpdateCommissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkCommissionInput) => commissionsApi.bulkUpdate(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commissionsQueryKey }),
  });
}
