"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adCampaignsApi } from "@/services/ad-campaigns";
import type { CreateAdCampaignInput, UpdateAdCampaignInput } from "@/types";

export const adCampaignsQueryKey = ["ad-campaigns"] as const;

export function useAdCampaigns() {
  return useQuery({
    queryKey: adCampaignsQueryKey,
    queryFn: adCampaignsApi.list,
    retry: 2,
  });
}

export function useAdCampaign(id?: string) {
  return useQuery({
    queryKey: [...adCampaignsQueryKey, id],
    queryFn: () => adCampaignsApi.get(id ?? ""),
    enabled: Boolean(id),
    retry: 1,
  });
}

export function useCreateAdCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, onUploadProgress }: { payload: CreateAdCampaignInput; onUploadProgress?: (percent: number) => void }) =>
      adCampaignsApi.create(payload, onUploadProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adCampaignsQueryKey }),
  });
}

export function useUpdateAdCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, onUploadProgress }: { id: string; payload: UpdateAdCampaignInput; onUploadProgress?: (percent: number) => void }) =>
      adCampaignsApi.update(id, payload, onUploadProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adCampaignsQueryKey }),
  });
}

export function useToggleAdCampaignStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adCampaignsApi.toggleStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adCampaignsQueryKey }),
  });
}

export function useDeleteAdCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adCampaignsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adCampaignsQueryKey }),
  });
}
