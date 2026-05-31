"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/services/bookings";

export function useBookings(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => bookingsApi.list(params),
  });
}

export function useBookingStats() {
  return useQuery({
    queryKey: ["bookings", "stats"],
    queryFn: bookingsApi.stats,
  });
}
