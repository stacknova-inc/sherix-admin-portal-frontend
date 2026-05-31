import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { CreateServiceInput, Service, UpdateServiceInput } from "@/types";

export const servicesApi = {
  async list() {
    const response = await api.get("/services");
    return unwrapArray<Service>(response.data);
  },
  async create(payload: CreateServiceInput) {
    const response = await api.post("/services", payload);
    return unwrapData<Service>(response.data);
  },
  async update(id: string, payload: UpdateServiceInput) {
    const response = await api.patch(`/services/${id}`, payload);
    return unwrapData<Service>(response.data);
  },
};
