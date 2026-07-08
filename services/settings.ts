import { api } from "@/lib/api";
import type { GeneralSettings, Settings } from "@/types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function normalizeSettings(response: unknown): Settings {
  const root = asRecord(response);
  const data = asRecord(root.data);
  const result = asRecord(root.result);
  const settings = asRecord(root.settings ?? data.settings ?? result.settings);
  const source = Object.keys(settings).length ? settings : Object.keys(data).length ? data : Object.keys(result).length ? result : root;
  return source as Settings;
}

function toApiPayload(input: GeneralSettings) {
  return {
    siteInfo: {
      platformName: input.platformName,
      platformDomain: input.platformDomain,
    },
    contactInfo: {
      supportEmail: input.supportEmail,
      supportPhone: input.supportPhone,
    },
    localization: {
      defaultCurrency: input.currency,
      currencyPosition: input.currencyPosition,
      timezone: input.timezone,
      dateFormat: input.dateFormat,
      timeFormat: input.timeFormat,
    },
    system: {
      maintenanceMode: input.maintenanceMode,
      sessionTimeout: input.sessionTimeout,
    },
  };
}

export const settingsApi = {
  async get() {
    const response = await api.get("/settings");
    return normalizeSettings(response.data);
    
  },
  async updateGeneral(input: GeneralSettings) {
    const response = await api.patch("/settings/general", toApiPayload(input));
    return normalizeSettings(response.data);
  },
};