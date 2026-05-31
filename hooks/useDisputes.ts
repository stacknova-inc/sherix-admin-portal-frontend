"use client";

import { useQuery } from "@tanstack/react-query";
import { disputesApi } from "@/services/disputes";

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
