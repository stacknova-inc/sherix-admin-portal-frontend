import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { Company } from "@/types";

export type CompanyAction = "approve" | "reject" | "suspend" | "activate";

export const companiesApi = {
  async list() {
    const response = await api.get("/companies");
    return unwrapArray<Company>(response.data);
  },
  async action(id: string, action: CompanyAction, payload?: { reason?: string }) {
    const response = await api.patch(`/companies/${id}/${action}`, payload);
    return unwrapData<Company>(response.data);
  },
};
