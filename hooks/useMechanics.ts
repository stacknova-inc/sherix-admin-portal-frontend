"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { mechanicsApi, type MechanicStatusAction, type MechanicVerificationAction } from "@/services/mechanics";
import { recordId } from "@/lib/live-data";
import type { Mechanic } from "@/types";

export const mechanicsQueryKey = ["mechanics"] as const;

export function useIndividualMechanics() {
  return useQuery({ queryKey: mechanicsQueryKey, queryFn: mechanicsApi.list });
}

function mergeMechanic(queryClient: QueryClient, userId: string, updated: Mechanic) {
  if (!updated || typeof updated !== "object") return;
  queryClient.setQueryData<Mechanic[]>(mechanicsQueryKey, (old) =>
    old?.map((mechanic) =>
      recordId(mechanic) === userId || String(mechanic.userId ?? "") === userId
        ? { ...mechanic, ...updated }
        : mechanic,
    ),
  );
}

export function useMechanicVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action, reason, idempotencyKey }: { userId: string; action: MechanicVerificationAction; reason?: string; idempotencyKey?: string }) =>
      mechanicsApi.verification(userId, action, reason ? { reason } : undefined, idempotencyKey),
    onSuccess: (updated, { userId }) => mergeMechanic(queryClient, userId, updated),
    onSettled: () => queryClient.invalidateQueries({ queryKey: mechanicsQueryKey }),
  });
}

export function useMechanicStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action, reason, idempotencyKey }: { userId: string; action: MechanicStatusAction; reason?: string; idempotencyKey?: string }) =>
      mechanicsApi.status(userId, action, reason ? { reason } : undefined, idempotencyKey),
    onSuccess: (updated, { userId }) => mergeMechanic(queryClient, userId, updated),
    onSettled: () => queryClient.invalidateQueries({ queryKey: mechanicsQueryKey }),
  });
}
