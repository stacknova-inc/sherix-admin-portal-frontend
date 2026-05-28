import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { Dispute } from "@/types";

export const disputesApi = {
  async list(params?: Record<string, string | number | undefined>) {
    const response = await api.get("/disputes", { params });
    return unwrapArray<Dispute>(response.data);
  },
  async stats() {
    const response = await api.get("/disputes/stats");
    return unwrapData<Record<string, unknown>>(response.data);
  },
  async get(id: string) {
    const response = await api.get(`/disputes/${id}`);
    return unwrapData<Dispute>(response.data);
  },
};
