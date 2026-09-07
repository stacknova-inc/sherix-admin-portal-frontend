"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services/notifications";
import type { BroadcastNotificationInput } from "@/types";

export const notificationsQueryKey = ["notifications"] as const;

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: notificationsQueryKey,
    enabled,
    queryFn: notificationsApi.list,
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, idempotencyKey }: { input: BroadcastNotificationInput; idempotencyKey?: string }) => notificationsApi.broadcast(input, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
}
