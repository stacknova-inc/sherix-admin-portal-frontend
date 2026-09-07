import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() }, unwrapData: (payload: unknown) => (payload as { data?: unknown })?.data ?? payload }));
import { api } from "@/lib/api";
import { disputeReasonsApi } from "./dispute-reasons";

describe("disputeReasonsApi", () => {
  beforeEach(() => { vi.mocked(api.get).mockReset(); vi.mocked(api.post).mockReset(); vi.mocked(api.patch).mockReset(); });
  it("uses the documented admin endpoint and title/isActive create payload", async () => { vi.mocked(api.post).mockResolvedValue({ data: {} }); await disputeReasonsApi.create({ title: "Overcharged for service", isActive: true }); expect(api.post).toHaveBeenCalledWith("/admin/dispute-reasons", { title: "Overcharged for service", isActive: true }); });
  it("uses the reason id for updates", async () => { vi.mocked(api.patch).mockResolvedValue({ data: {} }); await disputeReasonsApi.update("6a26fbcae37b4fa98a60e566", { title: "Updated", isActive: false }); expect(api.patch).toHaveBeenCalledWith("/admin/dispute-reasons/6a26fbcae37b4fa98a60e566", { title: "Updated", isActive: false }); });
});
