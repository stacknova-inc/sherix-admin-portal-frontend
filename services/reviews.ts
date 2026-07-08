import { api, unwrapData } from "@/lib/api";
import type { Review, ReviewStats } from "@/types";

export interface ReviewsListResponse {
  reviews: Review[];
  pagination?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function firstArray(...values: unknown[]) {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeReviewsResponse(response: unknown): ReviewsListResponse {
  const root = asRecord(response);
  const data = asRecord(root.data);
  const result = asRecord(root.result);
  const payload = Object.keys(data).length ? data : Object.keys(result).length ? result : root;
  const payloadData = asRecord(payload.data);
  const payloadResult = asRecord(payload.result);
  const source = Object.keys(payloadData).length ? payloadData : Object.keys(payloadResult).length ? payloadResult : payload;

  const reviews = firstArray(
    response,
    root.reviews,
    root.docs,
    root.items,
    data.reviews,
    data.docs,
    data.items,
    result.reviews,
    result.docs,
    result.items,
    source.reviews,
    source.docs,
    source.items,
    source.data,
  ) as Review[];

  return {
    reviews,
    pagination: root.pagination ?? data.pagination ?? result.pagination ?? source.pagination ?? root.meta ?? data.meta ?? result.meta ?? source.meta,
  };
}

function normalizeReviewStats(response: unknown): ReviewStats {
  const root = asRecord(response);
  const data = asRecord(root.data);
  const result = asRecord(root.result);
  const stats = asRecord(root.stats ?? root.reviewStats ?? data.stats ?? data.reviewStats ?? result.stats ?? result.reviewStats);
  const source = Object.keys(stats).length ? stats : Object.keys(data).length ? data : Object.keys(result).length ? result : root;
  return unwrapData<ReviewStats>(source);
}

export const reviewsApi = {
  async stats() {
    const response = await api.get("/reviews/stats");
    return normalizeReviewStats(response.data);
  },
  async list(params?: Record<string, string | number | undefined>) {
    const response = await api.get("/reviews", { params });
    return normalizeReviewsResponse(response.data);
  },
};