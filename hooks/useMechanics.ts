"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mechanicsApi, type MechanicStatusAction, type MechanicVerificationAction } from "@/services/mechanics";

export const mechanicsQueryKey = ["mechanics"] as const;

export function useIndividualMechanics() {
  return useQuery({ queryKey: mechanicsQueryKey, queryFn: mechanicsApi.list });
}

export function useMechanicVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action, reason }: { userId: string; action: MechanicVerificationAction; reason?: string }) =>
      mechanicsApi.verification(userId, action, reason ? { reason } : undefined),
    onSettled: () => queryClient.invalidateQueries({ queryKey: mechanicsQueryKey }),
  });
}

export function useMechanicStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action, reason }: { userId: string; action: MechanicStatusAction; reason?: string }) => mechanicsApi.status(userId, action, reason ? { reason } : undefined),
    onSettled: () => queryClient.invalidateQueries({ queryKey: mechanicsQueryKey }),
  });
}
