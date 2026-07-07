import { api, assertApiId, unwrapArray, unwrapData } from "@/lib/api";
import type { ServiceProvider } from "@/types";

export type ServiceProviderAction =
  | "reject"
  | "suspend"
  | "activate";

export const serviceProvidersApi = {
  async list(isEmployee?: boolean) {
    const response = await api.get("/users/service-providers", {
      params: typeof isEmployee === "boolean" ? { isEmployee } : undefined,
    });
    const providers = unwrapArray<ServiceProvider>(response.data);
    

    if (typeof isEmployee !== "boolean") return providers;
    return providers.filter((provider) => provider.isEmployee === isEmployee);
  },

  async action(
  id: string,
  action: ServiceProviderAction,
  payload?: { reason?: string }
) {
  const providerId = assertApiId(id, `Company ${action}`);

  console.info("[Sherix Companies] Running company action", {
    id: providerId,
    action,
    payload,
    endpoint: `/companies/${providerId}/${action}`,
  });

  try {
    const response = await api.patch(
      `/companies/${providerId}/${action}`,
      payload
    );

    console.info("[Sherix Companies] Company action succeeded", {
      id: providerId,
      action,
      response: response.data,
    });

    return unwrapData<ServiceProvider>(response.data);
  } catch (error) {
    console.error("[Sherix Companies] Company action failed", {
      id: providerId,
      action,
      payload,
      error,
    });

    throw error;
  }
}
};
