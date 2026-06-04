import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { Company } from "@/types";

export type CompanyAction = "approve" | "reject" | "suspend" | "activate";

export const companiesApi = {
  async list() {
    try {
      const response = await api.get("/users/service-providers");
      return unwrapArray<Company>(response.data);
    } catch (error) {
      console.warn("[Sherix Service Providers] /users/service-providers failed, retrying /companies.", error);
      const response = await api.get("/companies");
      return unwrapArray<Company>(response.data);
    }
  },
  async stats() {
    const response = await api.get("/users/service-providers/stats");
    return unwrapData<Record<string, unknown>>(response.data);
  },
  async action(id: string, action: CompanyAction, payload?: { reason?: string }) {
    const response = await api.patch(`/companies/${id}/${action}`, payload);
    return unwrapData<Company>(response.data);
  },
};
