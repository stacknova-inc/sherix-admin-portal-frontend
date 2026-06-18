"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/services/notifications";

export const notificationsQueryKey = ["notifications"] as const;

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: notificationsApi.list,
  });
}
