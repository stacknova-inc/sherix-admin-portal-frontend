"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewsApi } from "@/services/reviews";

export function useReviewStats() {
  return useQuery({
    queryKey: ["reviews", "stats"],
    queryFn: reviewsApi.stats,
  });
}

export function useReviews(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["reviews", params],
    queryFn: () => reviewsApi.list(params),
  });
}