import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn() },
  unwrapData: (payload: unknown) => (payload as { data?: unknown })?.data ?? payload,
  unwrapArray: (payload: unknown) => (payload as { data?: unknown })?.data ?? payload,
}));

import { api } from "@/lib/api";
import { commissionsApi } from "./commissions";

beforeEach(() => {
  vi.mocked(api.post).mockReset();
  vi.mocked(api.patch).mockReset();
  vi.mocked(api.patch).mockResolvedValue({ data: {} });
  vi.mocked(api.post).mockResolvedValue({ data: {} });
});

describe("commissionsApi.deactivate", () => {
  it("REGRESSION (D-3): sends expectedVersion so deactivation participates in optimistic concurrency like create/update do", async () => {
    await commissionsApi.deactivate("commission-1", 4);

    expect(api.patch).toHaveBeenCalledWith("/commissions/commission-1/deactivate", { expectedVersion: 4 });
  });
});

describe("commissionsApi idempotency key plumbing", () => {
  it("DUPLICATE MUTATION GUARD: a retry with the SAME idempotency key sends the SAME header value both times", async () => {
    const key = "fixed-attempt-key";
    const payload = { serviceId: "svc-1", commissionPercent: 10 };

    await commissionsApi.create(payload, key);
    await commissionsApi.create(payload, key); // simulated retry of the same attempt

    const calls = vi.mocked(api.post).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][2]).toEqual({ idempotencyKey: key });
    expect(calls[1][2]).toEqual({ idempotencyKey: key });
    expect(calls[0][2]).toEqual(calls[1][2]);
  });

  it("passes no idempotency key config when none is given (backward compatible)", async () => {
    await commissionsApi.create({ serviceId: "svc-1", commissionPercent: 10 });

    expect(api.post).toHaveBeenCalledWith("/commissions", { serviceId: "svc-1", commissionPercent: 10 }, { idempotencyKey: undefined });
  });
});
