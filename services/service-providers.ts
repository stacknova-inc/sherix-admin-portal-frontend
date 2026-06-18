import { api, assertApiId, unwrapArray, unwrapData } from "@/lib/api";
import type { ServiceProvider } from "@/types";

export type ServiceProviderAction = "suspend" | "activate";

export const serviceProvidersApi = {
  async list(isEmployee?: boolean) {
    const response = await api.get("/users/service-providers", {
      params: typeof isEmployee === "boolean" ? { isEmployee } : undefined,
    });
    const providers = unwrapArray<ServiceProvider>(response.data);

    if (typeof isEmployee !== "boolean") return providers;
    return providers.filter((provider) => provider.isEmployee === isEmployee);
  },

  async action(id: string, action: ServiceProviderAction, payload?: { reason?: string }) {
    const providerId = assertApiId(id, `Service provider ${action}`);
    console.info("[Sherix Providers] Running provider action", {
      id: providerId,
      action,
      payload,
      endpoint: `/users/${providerId}/${action}`,
    });

    try {
      const response = await api.patch(`/users/${providerId}/${action}`, payload);
      console.info("[Sherix Providers] Provider action succeeded", {
        id: providerId,
        action,
        response: response.data,
      });
      return unwrapData<ServiceProvider>(response.data);
    } catch (error) {
      console.error("[Sherix Providers] Provider action failed", {
        id: providerId,
        action,
        payload,
        error,
      });
      throw error;
    }
  },
};
