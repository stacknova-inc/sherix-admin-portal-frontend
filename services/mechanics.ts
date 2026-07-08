import {
  api,
  assertApiId,
  unwrapData,
} from "@/lib/api";
import { serviceProvidersApi } from "@/services/service-providers";
import type { ServiceProvider } from "@/types";

export type MechanicAction =
  | "activate"
  | "suspend";

async function mechanicAction(
  id: string,
  action: MechanicAction,
  payload?: { reason?: string }
) {
  const mechanicId = assertApiId(id, `Mechanic ${action}`);

  console.info("[Sherix Mechanics] Running mechanic action", {
    id: mechanicId,
    action,
    payload,
    endpoint: `/users/${mechanicId}/${action}`,
  });

  try {
    const response = await api.patch(
      `/users/${mechanicId}/${action}`,
      payload
    );

    console.info("[Sherix Mechanics] Mechanic action succeeded", {
      id: mechanicId,
      action,
      response: response.data,
    });

    return unwrapData<ServiceProvider>(response.data);
  } catch (error) {
    console.error("[Sherix Mechanics] Mechanic action failed", {
      id: mechanicId,
      action,
      payload,
      error,
    });

    throw error;
  }
}

export const individualMechanicsApi = {
  list: async () => {
    const providers = await serviceProvidersApi.list(true);

    console.log("========== INDIVIDUAL MECHANICS ==========");
    console.log(providers);

    return providers;
  },

  stats: async () => ({} as Record<string, unknown>),

  action: mechanicAction,
};

export const companyMechanicsApi = {
  list: async () => {
    const providers = await serviceProvidersApi.list(false);

    console.log("========== COMPANY MECHANICS ==========");
    console.log(providers);

    return providers;
  },

  stats: async () => ({} as Record<string, unknown>),

  action: mechanicAction,
};