import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/utils";
import { useUiStore } from "@/store/use-ui-store";

vi.mock("@/services/service-requests", () => ({
  serviceRequestsApi: { list: vi.fn(), stats: vi.fn() },
}));

import { serviceRequestsApi } from "@/services/service-requests";
import { useServiceRequestDetail } from "./useServiceRequests";

beforeEach(() => {
  useUiStore.setState({ accessToken: "test-token" });
  vi.mocked(serviceRequestsApi.list).mockReset();
});

describe("useServiceRequestDetail", () => {
  it("resolves via the search fallback when nothing is cached yet (no GET /:id endpoint exists)", async () => {
    vi.mocked(serviceRequestsApi.list).mockResolvedValueOnce({
      data: [{ _id: "sr-1", status: "arrived", updatedAt: "2024-01-01T00:05:00.000Z" }],
      pagination: { total: 1, page: 1, limit: 100, pages: 1 },
    });

    const { result } = renderHookWithQueryClient(() => useServiceRequestDetail("sr-1"));

    await waitFor(() => expect(result.current.data?.status).toBe("arrived"));
    expect(serviceRequestsApi.list).toHaveBeenCalledWith({ search: "sr-1", limit: 100 });
  });

  it("OUT-OF-ORDER GUARD: a refetch that resolves with an older updatedAt does not regress the cached state", async () => {
    vi.mocked(serviceRequestsApi.list)
      .mockResolvedValueOnce({
        data: [{ _id: "sr-1", status: "arrived", updatedAt: "2024-01-01T00:05:00.000Z" }],
        pagination: { total: 1, page: 1, limit: 100, pages: 1 },
      })
      .mockResolvedValueOnce({
       
        data: [{ _id: "sr-1", status: "en_route", updatedAt: "2024-01-01T00:01:00.000Z" }],
        pagination: { total: 1, page: 1, limit: 100, pages: 1 },
      });

    const { result } = renderHookWithQueryClient(() => useServiceRequestDetail("sr-1"));
    await waitFor(() => expect(result.current.data?.status).toBe("arrived"));

    await result.current.refetch();

    expect(result.current.data?.status).toBe("arrived");
  });

  it("throws a clear not-found error when the search fallback finds no match", async () => {
    vi.mocked(serviceRequestsApi.list).mockResolvedValueOnce({ data: [], pagination: { total: 0, page: 1, limit: 100, pages: 1 } });

    const { result } = renderHookWithQueryClient(() => useServiceRequestDetail("missing-id"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toMatch(/not found/i);
  });
});
