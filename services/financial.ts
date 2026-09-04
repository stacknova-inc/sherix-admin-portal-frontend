import { api, unwrapData } from "@/lib/api";
import { recordId } from "@/lib/live-data";
import type { FinancialEarnings, FinancialPagination, Transaction, TransactionListParams, TransactionListResult } from "@/types";

function toQueryParams(params?: TransactionListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") query[key] = value;
  }
  return query;
}

function extractTransactions(payload: unknown): Transaction[] {
  const data = unwrapData<unknown>(payload);
  const records = Array.isArray(data)
    ? data
    : (() => {
        const item = data as Record<string, unknown>;
        return item.transactions ?? item.data ?? item.items ?? item.docs ?? [];
      })();
  if (!Array.isArray(records)) return [];
  const seen = new Set<string>();
  return (records as Transaction[]).filter((transaction) => {
    const id = recordId(transaction);
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function extractPagination(payload: unknown, count: number, params?: TransactionListParams): FinancialPagination {
  const outer = payload as { pagination?: Partial<FinancialPagination>; data?: { pagination?: Partial<FinancialPagination> } };
  const pagination = outer?.pagination ?? outer?.data?.pagination ?? {};
  const page = Number(pagination.page ?? params?.page ?? 1) || 1;
  const limit = Number(pagination.limit ?? params?.limit ?? 20) || 20;
  const total = Number(pagination.total ?? count) || count;
  return { page, limit, total, pages: Number(pagination.pages ?? Math.max(1, Math.ceil(total / limit))) || 1 };
}

function hasPagination(payload: unknown) {
  const outer = payload as { pagination?: unknown; data?: { pagination?: unknown } };
  return Boolean(outer?.pagination ?? outer?.data?.pagination);
}

export const financialApi = {
  async earnings() {
    const response = await api.get("/financial/earnings");
    return unwrapData<FinancialEarnings>(response.data);
  },
  async transactions(params?: TransactionListParams): Promise<TransactionListResult> {
    const response = await api.get("/financial/transactions", { params: toQueryParams(params) });
    const data = extractTransactions(response.data);
    return { data, pagination: extractPagination(response.data, data.length, params), serverPaginated: hasPagination(response.data) };
  },
};
