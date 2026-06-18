import { serviceProvidersApi, type ServiceProviderAction } from "@/services/service-providers";

export type MechanicAction = ServiceProviderAction;

export const individualMechanicsApi = {
  list: () => serviceProvidersApi.list(true),
  stats: async () => ({} as Record<string, unknown>),
  action: serviceProvidersApi.action,
};

export const companyMechanicsApi = {
  list: () => serviceProvidersApi.list(false),
  stats: async () => ({} as Record<string, unknown>),
  action: serviceProvidersApi.action,
};
