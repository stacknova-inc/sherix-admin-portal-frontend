"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/services/services";
import type { CreateServiceInput, UpdateServiceInput } from "@/types";

export const servicesQueryKey = ["services"] as const;

export function useServices() {
  return useQuery({
    queryKey: servicesQueryKey,
    queryFn: servicesApi.list,
  });
}

export function useAddService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServiceInput) => servicesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: servicesQueryKey }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServiceInput }) => servicesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: servicesQueryKey }),
  });
}
