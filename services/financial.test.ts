import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn() },
  unwrapData: (payload: unknown) => (payload as { data?: unknown })?.data ?? payload,
}));

vi.mock("@/lib/live-data", () => ({
  recordId: (record: { _id?: string; id?: string; transactionId?: string }) => record._id ?? record.id ?? record.transactionId ?? "",
}));

import { api } from "@/lib/api";
import { financialApi } from "./financial";

describe("financialApi.transactions", () => {
  beforeEach(() => vi.mocked(api.get).mockReset());

  it("forwards populated backend filters and omits empty values", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } });
    await financialApi.transactions({ search: "", status: "pending", company: undefined, page: 2, limit: 10 });
    expect(api.get).toHaveBeenCalledWith("/financial/transactions", { params: { status: "pending", page: 2, limit: 10 } });
  });

  it("deduplicates transaction IDs while preserving the server's first row", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [{ _id: "tx-1", amount: 10 }, { _id: "tx-1", amount: 99 }, { _id: "tx-2", amount: 3 }], pagination: { total: 3, page: 1, limit: 10, pages: 1 } } });
    const result = await financialApi.transactions();
    expect(result.data).toHaveLength(2);
    expect(result.data.map((transaction) => transaction.amount)).toEqual([10, 3]);
    expect(result.pagination).toEqual({ total: 3, page: 1, limit: 10, pages: 1 });
    expect(result.serverPaginated).toBe(true);
  });
});
