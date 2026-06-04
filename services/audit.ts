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
  email?: string;
  role?: string;
  action?: string;
  actionType?: string;
  resource?: string;
  resourceType?: string;
  resourceId?: string;
  ip?: string;
  ipAddress?: string;
  status?: string;
  severity?: string;
  [key: string]: unknown;
}

export const auditApi = {
  async list(params?: Record<string, string | number | undefined>) {
    const response = await api.get("/audit/", { params });
    return unwrapArray<AuditLog>(response.data);
  },
  async stats() {
    const response = await api.get("/audit/stats");
    return unwrapData<Record<string, unknown>>(response.data);
  },
};
