import { api, assertApiId, logDetailedAxiosError, unwrapArray, unwrapData } from "@/lib/api";
import type { Company } from "@/types";

export type CompanyVerificationAction = "approve" | "reject";
export type CompanyStatusAction = "activate" | "suspend";

export const companiesApi = {
  async list() {
    const response = await api.get("/companies");
    return unwrapArray<Company>(response.data);
  },

  async verification(
    companyId: string,
    action: CompanyVerificationAction,
    payload?: { reason?: string },
    idempotencyKey?: string,
  ) {
    const verifiedCompanyId = assertApiId(companyId, `Company ${action}`);
    const verb = action === "approve" ? "approve" : "reject";
    const endpoint = `/admin/verification/companies/${verb}/${verifiedCompanyId}`;

    const response = await api.patch(endpoint, payload, { idempotencyKey });
    return unwrapData<Company>(response.data);
  },

  async status(
    companyId: string,
    action: CompanyStatusAction,
    payload?: { reason?: string },
    idempotencyKey?: string,
  ) {
    const targetCompanyId = assertApiId(companyId, `Company ${action}`);
    const verb = action === "activate" ? "reactivate" : "suspend";
    const endpoint = `/admin/verification/accounts/companies/${verb}/${targetCompanyId}`;

    try {
      const response = await api.patch(endpoint, payload, { idempotencyKey });
      return unwrapData<Company>(response.data);
    } catch (error) {
      logDetailedAxiosError(`${action.toUpperCase()} COMPANY DEBUG`, error);
      throw error;
    }
  },
};
