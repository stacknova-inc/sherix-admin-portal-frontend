import { api, unwrapArray } from "@/lib/api";
import type { ServiceProvider } from "@/types";

export const serviceProvidersApi = {
  async list() {
    const response = await api.get("/users/service-providers");
    return unwrapArray<ServiceProvider>(response.data);
  },
};
