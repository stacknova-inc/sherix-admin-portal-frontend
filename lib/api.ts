import axios, { AxiosError } from "axios";
import { useUiStore } from "@/store/use-ui-store";
import config from "@/tailwind.config";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;

    skipAuthRefresh?: boolean;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  "https://sherix-app-backend-production-84b9.up.railway.app/api/v1/";

function getApiBaseUrl() {
  return API_BASE_URL;
}

function generateCryptoUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    // Replaced the implicit math arrays with a clean string template format to satisfy the strict compiler
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
      const num = parseInt(c, 10);
      return (
        num ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))
      ).toString(16);
    });
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface BrowserContext {
  screen: string;
  timezone: string;
  cores: number;
  memory: number;
  lang: string;
}

function getBrowserContext(): BrowserContext {
  if (typeof window === "undefined") {
    return { screen: "", timezone: "", cores: 0, memory: 0, lang: "" };
  }

  const nav = navigator as any;

  return {
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    cores: navigator.hardwareConcurrency || 0,
    memory: nav.deviceMemory || 0,
    lang: navigator.language || "",
  };
}

export interface DevicePayload {
  id: string;
  signature: BrowserContext;
}

export function getOrCreateDeviceId(): DevicePayload {
  if (typeof window === "undefined") {
    return { id: "", signature: getBrowserContext() };
  }

  const STORAGE_KEY = "app_secure_device_token";
  let deviceUuid: string | null = null;

  try {
    deviceUuid = localStorage.getItem(STORAGE_KEY);
    if (!deviceUuid) {
      deviceUuid = sessionStorage.getItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Storage read blocked.");
  }

  if (!deviceUuid) {
    deviceUuid = generateCryptoUUID();
    try {
      localStorage.setItem(STORAGE_KEY, deviceUuid);
      sessionStorage.setItem(STORAGE_KEY, deviceUuid);
    } catch (e) {
      console.warn("Storage write blocked.");
    }
  } else {
    try {
      localStorage.setItem(STORAGE_KEY, deviceUuid);
    } catch (e) {}
  }

  return {
    id: deviceUuid,
    signature: getBrowserContext(),
  };
}

const DEVICE_ID = getOrCreateDeviceId().id;

export const api = axios.create({
  baseURL: undefined,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

function logApiError(error: unknown) {
  if (typeof window === "undefined") return;

  if (error instanceof AxiosError) {
    if (error.response?.status === 409) {
      return "This record was changed by another administrator. Refresh the data and try again.";
    }
    console.error("[Sherix API Error]", {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    return;
  }

  console.error("[Sherix API Error]", error);
}

export function isApiNotFound(error: unknown) {
  return error instanceof AxiosError && error.response?.status === 404;
}

export function isApiConflict(error: unknown) {
  return error instanceof AxiosError && error.response?.status === 409;
}

export function isUnknownOutcome(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false;
  if (error.response) return false;
  return (
    Boolean(error.request) ||
    error.code === "ECONNABORTED" ||
    error.message === "Network Error"
  );
}

export function getMutationOutcomeMessage(
  error: unknown,
  action = "This action",
): { message: string; outcome: "failed" | "unknown" } {
  if (isUnknownOutcome(error)) {
    return {
      outcome: "unknown",
      message: `${action} could not be confirmed - the connection was lost before a response arrived. It may or may not have gone through on the server. Refresh and check the current state before retrying.`,
    };
  }
  return {
    outcome: "failed",
    message: getErrorMessage(error, `${action} failed.`),
  };
}

export function describeMutationError(error: unknown, action: string): string {
  if (isApiConflict(error)) {
    return `${action} could not be completed — this record was changed by another administrator. Refresh and review the latest version before trying again.`;
  }
  return getMutationOutcomeMessage(error, action).message;
}

export function assertApiId(
  id: string | undefined | null,
  context: string,
): string {
  const value = String(id ?? "").trim();
  if (!value || value === "undefined" || value === "null") {
    console.error("[Sherix API] Missing id for mutation", { context, id });
    throw new Error(`${context} ID was not found.`);
  }
  return value;
}

export function uniqueIds(...ids: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      ids
        .map((id) => String(id ?? "").trim())
        .filter((id) => id && id !== "undefined" && id !== "null"),
    ),
  );
}

api.interceptors.request.use((config) => {
  const baseURL = getApiBaseUrl();
  if (!baseURL) {
    throw new Error(
      "Missing backend URL. Set NEXT_PUBLIC_API_BASE_URL in .env.local and restart Next.js.",
    );
  }

  const { accessToken } = useUiStore.getState();

  config.baseURL = baseURL.replace(/\/+$/, "");
  config.headers.set("x-device-id", DEVICE_ID);
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

function redirectToSignIn() {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/sign-in")) return;
  window.location.assign("/sign-in?reason=session-expired");
}

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    logApiError(error);

    const config = error.config;
    const status = error.response?.status;

    if (status !== 401 || !config || config.skipAuthRefresh || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = useUiStore
          .getState()
          .refreshSession()
          .finally(() => {
            refreshPromise = null;
          });
      }
      await refreshPromise;
      return api(config);
    } catch (refreshError) {
      useUiStore.getState().signOut();
      redirectToSignIn();
      return Promise.reject(refreshError);
    }
  },
);

const SENSITIVE_HEADER_KEYS = [
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "api-key",
  "token",
  "refresh-token",
  "x-refresh-token",
];

function redactHeaders(headers: unknown): Record<string, unknown> {
  if (!headers || typeof headers !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(
    headers as Record<string, unknown>,
  )) {
    out[key] = SENSITIVE_HEADER_KEYS.includes(key.toLowerCase())
      ? "[REDACTED]"
      : value;
  }
  return out;
}

function safeParse(data: unknown): unknown {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

/**
 * TEMPORARY DEBUG HELPER — remove once the suspend-company 400 is diagnosed.
 * Logs the full axios error (request + response) with secrets redacted.
 */
export function logDetailedAxiosError(label: string, error: unknown) {
  if (!(error instanceof AxiosError)) {
    console.error(`[${label}] Non-axios error:`, error);
    return;
  }

  const cfg = error.config;
  const res = error.response;
  const requestData = safeParse(cfg?.data);
  const responseData = res?.data as
    | {
        message?: unknown;
        error?: unknown;
        statusCode?: unknown;
        errors?: unknown;
      }
    | undefined;

  const fullUrl =
    cfg?.baseURL && cfg?.url
      ? `${cfg.baseURL.replace(/\/+$/, "")}/${String(cfg.url).replace(/^\/+/, "")}`
      : cfg?.url;

  const lines = [
    `\n========== ${label} ==========`,
    `METHOD:\n${cfg?.method?.toUpperCase()}`,
    `BASE URL:\n${cfg?.baseURL}`,
    `FULL URL:\n${fullUrl}`,
    `REQUEST DATA:\n${JSON.stringify(requestData, null, 2)}`,
    `REQUEST HEADERS:\n${JSON.stringify(redactHeaders(cfg?.headers), null, 2)}`,
    `STATUS:\n${res?.status} ${res?.statusText ?? ""}`,
    `RESPONSE DATA:\n${JSON.stringify(responseData, null, 2)}`,
    `RESPONSE HEADERS:\n${JSON.stringify(redactHeaders(res?.headers), null, 2)}`,
    `BACKEND MESSAGE:\n${responseData?.message ?? "(none)"}`,
    `BACKEND ERROR:\n${responseData?.error ?? "(none)"}`,
    `BACKEND VALIDATION ERRORS:\n${JSON.stringify(responseData?.errors ?? "(none)", null, 2)}`,
    `BACKEND STATUS CODE:\n${responseData?.statusCode ?? "(none)"}`,
    `ERROR CODE:\n${error.code}`,
    `============================================\n`,
  ];

  console.error(lines.join("\n"));
}

export function unwrapData<T>(response: unknown): T {
  const value = response as {
    data?: unknown;
    result?: unknown;
    items?: unknown;
    docs?: unknown;
  };
  if (Array.isArray(value)) return value as T;
  if (value?.data !== undefined) return unwrapData<T>(value.data);
  if (value?.result !== undefined) return unwrapData<T>(value.result);
  if (value?.items !== undefined) return value.items as T;
  if (value?.docs !== undefined) return value.docs as T;
  return response as T;
}

export function unwrapArray<T>(response: unknown): T[] {
  const data = unwrapData<unknown>(response);
  if (Array.isArray(data)) return data as T[];

  const record = data as Record<string, unknown>;
  for (const key of [
    "services",
    "issues",
    "commissions",
    "companies",
    "serviceProviders",
    "providers",
    "users",
    "serviceRequests",
    "bookings",
    "transactions",
    "disputes",
    "auditLogs",
    "logs",
    "events",
    "campaigns",
    "adCampaigns",
    "legalDocuments",
    "documents",
    "data",
  ]) {
    if (Array.isArray(record?.[key])) return record[key] as T[];
  }

  return [];
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | {
          message?: string;
          error?: string;
          errors?: Array<{
            path: string;
            msg: string;
          }>;
        }
      | string
      | undefined;

    if (typeof data === "string") {
      return data;
    }

    if (data?.errors?.length) {
      return data.errors.map((e) => e.msg).join(", ");
    }

    return data?.message ?? data?.error ?? error.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}
