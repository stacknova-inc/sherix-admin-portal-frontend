import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn() },
  unwrapArray: (payload: unknown) => {
    const data = (payload as { data?: unknown })?.data ?? payload;
    return Array.isArray(data) ? data : [];
  },
  unwrapData: (payload: unknown) => (payload as { data?: unknown })?.data ?? payload,
}));

import { api } from "@/lib/api";
import { auditApi } from "./audit";

describe("auditApi", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it("sends the documented filter query params, dropping empty ones", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } });
    await auditApi.list({ actor: "jane@sherix.com", action: "suspend", entityType: "user", entityId: "u-1", outcome: "failed", startDate: "2026-01-01", endDate: "", page: 1, limit: 20 });
    expect(api.get).toHaveBeenCalledWith("/audit/", {
      params: { actor: "jane@sherix.com", action: "suspend", entityType: "user", entityId: "u-1", outcome: "failed", startDate: "2026-01-01", page: 1, limit: 20 },
    });
  });

  it("reports serverPaginated: false and derives pagination when the backend returns a bare array", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [{ _id: "a-1" }, { _id: "a-2" }] } });
    const result = await auditApi.list({ page: 1, limit: 20 });
    expect(result.data).toHaveLength(2);
    expect(result.serverPaginated).toBe(false);
    expect(result.pagination).toEqual({ total: 2, page: 1, limit: 20, pages: 1 });
  });

  it("reports serverPaginated: true and uses backend pagination metadata when present", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [{ _id: "a-1" }], pagination: { total: 45, page: 2, limit: 20, pages: 3 } } });
    const result = await auditApi.list({ page: 2, limit: 20 });
    expect(result.serverPaginated).toBe(true);
    expect(result.pagination).toEqual({ total: 45, page: 2, limit: 20, pages: 3 });
  });
});
