"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/services/bookings";
import { useUiStore } from "@/store/use-ui-store";

export function useBookings(params?: Record<string, string | number | undefined>) {
  const token = useUiStore((state) => state.token);
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => bookingsApi.list(params),
    enabled: Boolean(token),
  });
}

export function useBookingStats() {
  const token = useUiStore((state) => state.token);
  return useQuery({
    queryKey: ["bookings", "stats"],
    queryFn: bookingsApi.stats,
    enabled: Boolean(token),
  });
}
