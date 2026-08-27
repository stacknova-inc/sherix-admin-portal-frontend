import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { BulkCommissionInput, Commission, CommissionInput } from "@/types";

export const commissionsApi = {
  async list() {
    const response = await api.get("/commissions");
    return unwrapArray<Commission>(response.data);
  },
  async get(id: string) {
    const response = await api.get(`/commissions/${id}`);
    return unwrapData<Commission>(response.data);
  },
  async getEffectiveForService(serviceId: string) {
    const response = await api.get(`/commissions/service/${serviceId}`);
    return unwrapData<Commission>(response.data);
  },
  async create(payload: CommissionInput) {
    const response = await api.post("/commissions", payload);
    return unwrapData<Commission>(response.data);
  },
  async update(id: string, payload: CommissionInput) {
    const response = await api.patch(`/commissions/${id}`, payload);
    return unwrapData<Commission>(response.data);
  },
  async deactivate(id: string) {
    const response = await api.patch(`/commissions/${id}/deactivate`, {});
    return unwrapData<Commission>(response.data);
  },
  async bulkUpdate(payload: BulkCommissionInput) {
    const response = await api.put("/commissions/bulk", payload);
    return unwrapArray<Commission>(response.data);
  },
};
