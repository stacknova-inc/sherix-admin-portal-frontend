import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { ServiceRequest } from "@/types";

export const serviceRequestsApi = {
  async list(params?: Record<string, string | number | undefined>) {
    const response = await api.get("/service-requests", { params });
    return unwrapArray<ServiceRequest>(response.data);
  },
  async stats() {
    const response = await api.get("/service-requests/stats");
    return unwrapData<Record<string, unknown>>(response.data);
  },
};
