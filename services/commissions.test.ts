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
