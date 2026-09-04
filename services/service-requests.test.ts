import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn() },
  unwrapData: (payload: unknown) => (payload as { data?: unknown })?.data ?? payload,
}));

import { api } from "@/lib/api";
import { serviceRequestsApi } from "./service-requests";

describe("serviceRequestsApi.list - duplicate record protection", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it("DUPLICATE EVENT GUARD: a response containing the same service request id twice yields only one row", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: [
          { _id: "sr-1", status: "en_route" },
          { _id: "sr-1", status: "en_route" },
          { _id: "sr-2", status: "arrived" },
        ],
        pagination: { total: 3, page: 1, limit: 20, pages: 1 },
      },
    });

    const result = await serviceRequestsApi.list();

    expect(result.data).toHaveLength(2);
    expect(result.data.map((r) => r._id)).toEqual(["sr-1", "sr-2"]);
  });

  it("keeps the FIRST occurrence when duplicates disagree (server's primary ordering wins)", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: [
          { _id: "sr-1", status: "arrived" },
          { _id: "sr-1", status: "en_route" },
        ],
      },
    });

    const result = await serviceRequestsApi.list();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].status).toBe("arrived");
  });

  it("passes query params through and reads a real pagination block when present", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { data: [], pagination: { total: 42, page: 2, limit: 10, pages: 5 } },
    });

    const result = await serviceRequestsApi.list({ status: "arrived", page: 2, limit: 10 });

    expect(api.get).toHaveBeenCalledWith("/service-requests", { params: { status: "arrived", page: 2, limit: 10 } });
    expect(result.pagination).toEqual({ total: 42, page: 2, limit: 10, pages: 5 });
  });

  it("omits empty/undefined filter values from the request instead of sending them as literal params", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } });

    await serviceRequestsApi.list({ status: "", customer: undefined, priority: "high" });

    expect(api.get).toHaveBeenCalledWith("/service-requests", { params: { priority: "high" } });
  });
});
