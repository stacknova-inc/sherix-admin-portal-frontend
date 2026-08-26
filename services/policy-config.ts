import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { PolicyConfig, PolicyConfigHistoryEntry, PolicyConfigUpdateInput } from "@/types";

export const policyConfigApi = {
  async getEffective() {
    const response = await api.get("/policy-config/effective");
    return unwrapData<PolicyConfig>(response.data);
  },
  async getHistory() {
    const response = await api.get("/policy-config/history");
    return unwrapArray<PolicyConfigHistoryEntry>(response.data);
  },
  async update(payload: PolicyConfigUpdateInput) {
    const response = await api.patch("/policy-config", payload);
    return unwrapData<PolicyConfig>(response.data);
  },
};
