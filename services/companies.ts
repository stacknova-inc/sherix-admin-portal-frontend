import { api, assertApiId, unwrapArray, unwrapData } from "@/lib/api";
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
    payload?: { reason?: string }
  ) {
    const verifiedCompanyId = assertApiId(companyId, `Company ${action}`);
    const verb = action === "approve" ? "approve" : "reject";
    const endpoint = `/admin/verification/companies/${verb}/${verifiedCompanyId}`;

    const response = await api.patch(endpoint, payload);
    return unwrapData<Company>(response.data);
  },

  async status(
    companyId: string,
    action: CompanyStatusAction,
    payload?: { reason?: string }
  ) {
    const targetCompanyId = assertApiId(companyId, `Company ${action}`);
    const endpoint =
      action === "activate"
        ? `/admin/verification/accounts/company/suspend/${targetCompanyId}`
        : `/companies/${targetCompanyId}/suspend`;

    const response = await api.patch(endpoint, payload);
    return unwrapData<Company>(response.data);
  },
};
