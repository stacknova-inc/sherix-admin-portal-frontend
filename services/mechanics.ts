import { api, assertApiId, unwrapArray, unwrapData } from "@/lib/api";
import { serviceProvidersApi } from "@/services/service-providers";
import type { Mechanic } from "@/types";

export type MechanicVerificationAction = "approve" | "reject";
export type MechanicStatusAction = "activate" | "suspend";

export const mechanicsApi = {
  async list() {
    const response = await serviceProvidersApi.list();
    return unwrapArray<Mechanic>(response).filter(
      (mechanic) => mechanic.role === "mechanic",
    );
  },

  async verification(userId: string, action: MechanicVerificationAction, payload?: { reason?: string }) {
    const mechanicUserId = assertApiId(userId, `Mechanic ${action}`);
    const verb = action === "approve" ? "approve" : "reject";
    const endpoint = `/admin/verification/mechanics/${verb}/${mechanicUserId}`;

    const response = await api.patch(endpoint, payload);
    return unwrapData<Mechanic>(response.data);
  },

  async status(
    userId: string,
    action: MechanicStatusAction,
    payload?: { reason?: string },
  ) {
    const mechanicUserId = assertApiId(userId, `Mechanic ${action}`);
    const verb = action === "activate" ? "reactivate" : "suspend";
    const endpoint = `/admin/verification/accounts/users/${verb}/${mechanicUserId}`;

    const response = await api.patch(endpoint, payload);
    
    console.warn(`[${action.toUpperCase()} MECHANIC DEBUG] raw response.data:`, JSON.stringify(response.data, null, 2));
    return unwrapData<Mechanic>(response.data);
  },
};
