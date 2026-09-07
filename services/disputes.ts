import { api, unwrapData } from "@/lib/api";
import { recordId } from "@/lib/live-data";
import type { Dispute, DisputeListResult, FinancialPagination, ResolveDisputeInput } from "@/types";

type ListParams = Record<string, string | number | undefined>;
function queryParams(params?: ListParams) { return Object.fromEntries(Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== "")); }
function extractList(payload: unknown): Dispute[] {
  const data = unwrapData<unknown>(payload); const record = data as Record<string, unknown>;
  const items = Array.isArray(data) ? data : record.disputes ?? record.data ?? record.items ?? record.docs ?? [];
  const seen = new Set<string>();
  return Array.isArray(items) ? (items as Dispute[]).filter((item) => { const id = recordId(item); if (!id || !seen.has(id)) { if (id) seen.add(id); return true; } return false; }) : [];
}
function pagination(payload: unknown, count: number, params?: ListParams): FinancialPagination {
  const root = payload as { pagination?: Partial<FinancialPagination>; data?: { pagination?: Partial<FinancialPagination> } }; const value = root.pagination ?? root.data?.pagination ?? {};
  const page = Number(value.page ?? params?.page ?? 1) || 1; const limit = Number(value.limit ?? params?.limit ?? 20) || 20; const total = Number(value.total ?? count) || count;
  return { page, limit, total, pages: Number(value.pages ?? Math.max(1, Math.ceil(total / limit))) || 1 };
}
function serverPaginated(payload: unknown) { const root = payload as { pagination?: unknown; data?: { pagination?: unknown } }; return Boolean(root.pagination ?? root.data?.pagination); }

export const disputesApi = {
  async list(params?: ListParams): Promise<DisputeListResult> { const response = await api.get("/disputes", { params: queryParams(params) }); const data = extractList(response.data); return { data, pagination: pagination(response.data, data.length, params), serverPaginated: serverPaginated(response.data) }; },
  async stats() { const response = await api.get("/disputes/stats"); return unwrapData<Record<string, unknown>>(response.data); },
  async get(id: string) { const response = await api.get(`/disputes/${id}`); return unwrapData<Dispute>(response.data); },
  async updateStatus(id: string, status: string) { const response = await api.patch(`/disputes/${id}`, { status }); return unwrapData<Dispute>(response.data); },
  async resolve(id: string, input: ResolveDisputeInput, idempotencyKey?: string) { const response = await api.post(`/disputes/${id}/resolve`, input, { idempotencyKey }); return unwrapData<Dispute>(response.data); },
};
