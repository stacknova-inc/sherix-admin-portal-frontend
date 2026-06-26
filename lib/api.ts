import axios, { AxiosError } from "axios";
import { useUiStore } from "@/store/use-ui-store";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Set once a request has already been retried after a token refresh, to stop retry loops. */
    _retry?: boolean;
    /** Set on auth endpoints (login, refresh) so a 401 from them never triggers another refresh attempt. */
    skipAuthRefresh?: boolean;
  }
}

const DEVICE_ID = "1234";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  "";

function getApiBaseUrl() {
  if (typeof window === "undefined") return API_BASE_URL;

  return (
    window.localStorage.getItem("NEXT_PUBLIC_API_BASE_URL") ??
    window.localStorage.getItem("sherix_api_base_url") ??
    "/api/backend"
  );
}

export const api = axios.create({
  baseURL: undefined,
  headers: {
    "Content-Type": "application/json",
  },
});

function logApiError(error: unknown) {
  if (typeof window === "undefined") return;

  if (error instanceof AxiosError) {
    console.error("[Sherix API Error]", {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      data: error.response?.data,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      statusText: error.response?.statusText,
      response: error.response?.data,
      message: error.message,
    });
    return;
  }

  console.error("[Sherix API Error]", error);
}

export function isApiNotFound(error: unknown) {
  return error instanceof AxiosError && error.response?.status === 404;
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

  // useUiStore (persisted via Zustand) is the single source of truth for the access token —
  // there is no separate localStorage key to fall out of sync with.
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
  window.location.assign("/sign-in");
}

// Ensures concurrent 401s triggered by parallel requests share a single in-flight
// refresh call instead of each firing their own POST /auth/refresh-tokens.
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
    "companies",
    "serviceProviders",
    "providers",
    "users",
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
      | { message?: string; error?: string }
      | string
      | undefined;
    if (typeof data === "string") return data;
    return data?.message ?? data?.error ?? error.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}
