import { api, unwrapArray, unwrapData } from "@/lib/api";

export interface AuditLog {
  _id?: string;
  id?: string;
  createdAt?: string;
  timestamp?: string;
  time?: string;
  user?: unknown;
  admin?: unknown;
  actor?: unknown;
  performedBy?: unknown;
  email?: string;
  role?: string;
  action?: string;
  actionType?: string;
  resource?: string;
  resourceType?: string;
  resourceId?: string;
  entityType?: string;
  entityId?: string;
  targetType?: string;
  targetId?: string;
  target?: unknown;
  reason?: string;
  note?: string;
  result?: string;
  outcome?: string;
  ip?: string;
  ipAddress?: string;
  status?: string;
  severity?: string;
  before?: unknown;
  after?: unknown;
  changes?: unknown;
  diff?: unknown;
  [key: string]: unknown;
}

export interface AuditLogListParams {
  search?: string;
  actor?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  outcome?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuditLogListResult {
  data: AuditLog[];
  pagination: AuditLogPagination;
  serverPaginated: boolean;
}

function queryParams(params?: AuditLogListParams) {
  return Object.fromEntries(Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ""));
}

function pagination(payload: unknown, count: number, params?: AuditLogListParams): AuditLogPagination {
  const root = payload as { pagination?: Partial<AuditLogPagination>; data?: { pagination?: Partial<AuditLogPagination> } };
  const value = root.pagination ?? root.data?.pagination ?? {};
  const page = Number(value.page ?? params?.page ?? 1) || 1;
  const limit = Number(value.limit ?? params?.limit ?? 20) || 20;
  const total = Number(value.total ?? count) || count;
  return { page, limit, total, pages: Number(value.pages ?? Math.max(1, Math.ceil(total / limit))) || 1 };
}

function serverPaginated(payload: unknown) {
  const root = payload as { pagination?: unknown; data?: { pagination?: unknown } };
  return Boolean(root.pagination ?? root.data?.pagination);
}

export const auditApi = {
  async list(params?: AuditLogListParams): Promise<AuditLogListResult> {
    const response = await api.get("/audit/", { params: queryParams(params) });
    const data = unwrapArray<AuditLog>(response.data);
    return { data, pagination: pagination(response.data, data.length, params), serverPaginated: serverPaginated(response.data) };
  },
  async stats() {
    const response = await api.get("/audit/stats");
    return unwrapData<Record<string, unknown>>(response.data);
  },
};
