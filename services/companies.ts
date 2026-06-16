import { serviceProvidersApi, type ServiceProviderAction } from "@/services/service-providers";

export type CompanyAction = ServiceProviderAction;

export const companiesApi = {
  list: () => serviceProvidersApi.list(false),
  stats: async () => ({} as Record<string, unknown>),
  action: serviceProvidersApi.action,
};
