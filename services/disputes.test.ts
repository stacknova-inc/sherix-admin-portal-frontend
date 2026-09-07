import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), patch: vi.fn(), post: vi.fn() }, unwrapData: (payload: unknown) => (payload as { data?: unknown })?.data ?? payload }));
vi.mock("@/lib/live-data", () => ({ recordId: (record: { _id?: string; id?: string }) => record._id ?? record.id ?? "" }));

import { api } from "@/lib/api";
import { disputesApi } from "./disputes";

describe("disputesApi", () => {
  beforeEach(() => { vi.mocked(api.get).mockReset(); vi.mocked(api.patch).mockReset(); vi.mocked(api.post).mockReset(); });
  it("removes duplicate disputes while keeping the first response occurrence", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [{ _id: "d-1", reason: "first" }, { _id: "d-1", reason: "duplicate" }, { _id: "d-2" }] } });
    const result = await disputesApi.list();
    expect(result.data).toHaveLength(2); expect(result.data[0].reason).toBe("first"); expect(result.serverPaginated).toBe(false);
  });
  it("sends the documented status and resolve payloads", async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: {} }); vi.mocked(api.post).mockResolvedValue({ data: {} });
    await disputesApi.updateStatus("d-1", "under_review");
    await disputesApi.resolve("d-1", { outcome: "warning", party: "customer", amount: 0, note: "Evidence reviewed" }, "stable-key");
    expect(api.patch).toHaveBeenCalledWith("/disputes/d-1", { status: "under_review" });
    expect(api.post).toHaveBeenCalledWith("/disputes/d-1/resolve", { outcome: "warning", party: "customer", amount: 0, note: "Evidence reviewed" }, { idempotencyKey: "stable-key" });
  });
});
