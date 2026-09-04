"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceRequestsApi } from "@/services/service-requests";
import { recordId } from "@/lib/live-data";
import { pickNewerServiceRequest } from "@/lib/service-request-helpers";
import { useUiStore } from "@/store/use-ui-store";
import type { ServiceRequest, ServiceRequestListParams, ServiceRequestListResult } from "@/types";

export const serviceRequestsListKey = (params?: ServiceRequestListParams) => ["serviceRequests", "list", params ?? {}] as const;
export const serviceRequestDetailKey = (id: string | undefined) => ["serviceRequests", "detail", id] as const;

export function useServiceRequests(params?: ServiceRequestListParams) {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: serviceRequestsListKey(params),
    queryFn: () => serviceRequestsApi.list(params),
    enabled: Boolean(token),
    placeholderData: (previous) => previous,
  });
}

export function useServiceRequestStats() {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["serviceRequests", "stats"],
    queryFn: serviceRequestsApi.stats,
    enabled: Boolean(token),
  });
}

function findInCachedLists(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  return queryClient
    .getQueriesData<ServiceRequestListResult>({ queryKey: ["serviceRequests", "list"] })
    .flatMap(([, result]) => result?.data ?? [])
    .find((request) => recordId(request) === id);
}

export function useServiceRequestDetail(id: string | undefined) {
  const token = useUiStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const queryKey = serviceRequestDetailKey(id);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!id) throw new Error("Missing service request id.");

      const { data } = await serviceRequestsApi.list({ search: id, limit: 100 });
      const match = data.find(
        (request) => recordId(request) === id || request.jobId === id || request.requestId === id,
      );
      if (!match) {
        throw new Error("Service request not found or no longer resolvable from the list endpoint's search results.");
      }

     
      const current = queryClient.getQueryData<ServiceRequest>(queryKey);
      return pickNewerServiceRequest(current, match);
    },
    initialData: () => (id ? findInCachedLists(queryClient, id) : undefined),

    initialDataUpdatedAt: 0,
    enabled: Boolean(token && id),
    retry: false,
  });
}
