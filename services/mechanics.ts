import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { Company } from "@/types";

export type MechanicAction = "approve" | "reject" | "suspend" | "activate";

export const individualMechanicsApi = {
  async list() {
    try {
      const response = await api.get("/users/service-providers?role=individual");
      return unwrapArray<Company>(response.data);
    } catch {
      const response = await api.get("/users/service-providers", {
        params: { role: "individual", type: "individual" },
      });
      return unwrapArray<Company>(response.data);
    }
  },
  async stats() {
    try {
      const response = await api.get("/users/service-providers/stats?role=individual");
      return unwrapData<Record<string, unknown>>(response.data);
    } catch {
      return {} as Record<string, unknown>;
    }
  },
  async action(id: string, action: MechanicAction, payload?: { reason?: string }) {
    const response = await api.patch(`/users/${id}/${action}`, payload);
    return unwrapData<Company>(response.data);
  },
};

export const companyMechanicsApi = {
  async list() {
    try {
      const response = await api.get("/users/service-providers?isEmployee=true");
      console.log("Fetched company mechanics from /users/service-providers:", response.data);
      return unwrapArray<Company>(response.data);
    } catch {
      const response = await api.get("/companies");
      return unwrapArray<Company>(response.data);
    }
  },
  async stats() {
    try {
      const response = await api.get("/users/service-providers/stats?role=company");
      return unwrapData<Record<string, unknown>>(response.data);
    } catch {
      return {} as Record<string, unknown>;
    }
  },
  async action(id: string, action: MechanicAction, payload?: { reason?: string }) {
    const response = await api.patch(`/companies/${id}/${action}`, payload);
    return unwrapData<Company>(response.data);
  },
};