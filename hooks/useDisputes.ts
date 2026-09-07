"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disputesApi } from "@/services/disputes";
import type { ResolveDisputeInput } from "@/types";

export function useDisputes(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["disputes", params],
    queryFn: () => disputesApi.list(params),
  });
}

export function useDisputeStats() {
  return useQuery({
    queryKey: ["disputes", "stats"],
    queryFn: disputesApi.stats,
  });
}

export function useDispute(id?: string) {
  return useQuery({
    queryKey: ["disputes", id],
    queryFn: () => disputesApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => disputesApi.updateStatus(id, status), onSuccess: (_, variables) => { void queryClient.invalidateQueries({ queryKey: ["disputes"] }); void queryClient.invalidateQueries({ queryKey: ["disputes", variables.id] }); } });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, input, idempotencyKey }: { id: string; input: ResolveDisputeInput; idempotencyKey?: string }) => disputesApi.resolve(id, input, idempotencyKey), onSuccess: (_, variables) => { void queryClient.invalidateQueries({ queryKey: ["disputes"] }); void queryClient.invalidateQueries({ queryKey: ["disputes", variables.id] }); } });
}
