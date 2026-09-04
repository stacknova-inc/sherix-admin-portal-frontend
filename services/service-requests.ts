import { api, unwrapData } from "@/lib/api";
import { recordId } from "@/lib/live-data";
import type { ServiceRequest, ServiceRequestListParams, ServiceRequestListResult, ServiceRequestPagination } from "@/types";

function toQueryParams(params?: ServiceRequestListParams): Record<string, string | number> {
  if (!params) return {};
  const query: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query[key] = value;
  }
  return query;
}


function dedupeById(records: ServiceRequest[]): ServiceRequest[] {
  const seen = new Set<string>();
  const result: ServiceRequest[] = [];
  for (const record of records) {
    const id = recordId(record);
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    result.push(record);
  }
  return result;
}

function extractList(payload: unknown): ServiceRequest[] {
  const data = unwrapData<unknown>(payload);
  if (Array.isArray(data)) return dedupeById(data as ServiceRequest[]);
  const record = data as Record<string, unknown>;
  const list = record?.serviceRequests ?? record?.data ?? record?.items ?? record?.docs;
  return Array.isArray(list) ? dedupeById(list as ServiceRequest[]) : [];
}

function extractPagination(payload: unknown, fallbackCount: number, params?: ServiceRequestListParams): ServiceRequestPagination {
  const record = (payload as { pagination?: Partial<ServiceRequestPagination> } | undefined)?.pagination ?? {};
  const page = Number(record.page ?? params?.page ?? 1) || 1;
  const limit = Number(record.limit ?? params?.limit ?? 20) || 20;
  const total = Number(record.total ?? fallbackCount) || fallbackCount;
  const pages = Number(record.pages ?? Math.max(1, Math.ceil(total / limit))) || 1;
  return { total, page, limit, pages };
}

export const serviceRequestsApi = {
  async list(params?: ServiceRequestListParams): Promise<ServiceRequestListResult> {
    const response = await api.get("/service-requests", { params: toQueryParams(params) });
    const data = extractList(response.data);
    const pagination = extractPagination(response.data, data.length, params);
    return { data, pagination };
  },

  async stats() {
    const response = await api.get("/service-requests/stats");
    return unwrapData<Record<string, unknown>>(response.data);
  },
};
