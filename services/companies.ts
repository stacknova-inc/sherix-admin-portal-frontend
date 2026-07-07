import {
  api,
  assertApiId,
  unwrapData,
} from "@/lib/api";
import { serviceProvidersApi } from "@/services/service-providers";
import type { ServiceProvider } from "@/types";

export type CompanyAction =
  | "approve"
  | "reject"
  | "suspend"
  | "activate";

async function companyAction(
  id: string,
  action: CompanyAction,
  payload?: { reason?: string }
) {
  const companyId = assertApiId(id, `Company ${action}`);

  console.info("[Sherix Companies] Running company action", {
    id: companyId,
    action,
    payload,
    endpoint: `/companies/${companyId}/${action}`,
  });

  try {
    const response = await api.patch(
      `/companies/${companyId}/${action}`,
      payload
    );

    console.info("[Sherix Companies] Company action succeeded", {
      id: companyId,
      action,
      response: response.data,
    });

    return unwrapData<ServiceProvider>(response.data);
  } catch (error) {
    console.error("[Sherix Companies] Company action failed", {
      id: companyId,
      action,
      payload,
      error,
    });

    throw error;
  }
}

export const companiesApi = {
  list: async () => {
    const companies = await serviceProvidersApi.list(false);

    console.log("========== COMPANY PROVIDERS ==========");
    console.log(companies);

    return companies;
  },

  stats: async () => ({} as Record<string, unknown>),

  action: companyAction,
};