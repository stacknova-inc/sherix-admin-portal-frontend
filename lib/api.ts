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
  "";

function getApiBaseUrl() {
  return API_BASE_URL;
}

const DEVICE_ID = "12345";



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