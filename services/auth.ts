import { api, unwrapData } from "@/lib/api";

export const ADMIN_PORTAL_ROLE = "sherix_admin";
export const DEVICE_ID = "1234";

export interface AuthUser {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  email: string;
  role: string;
  initials?: string;
  [key: string]: unknown;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  role: string;
  user: AuthUser;
  expiresAt: number;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function pickToken(payload: Record<string, unknown>) {
  return (
    payload.token ??
    payload.accessToken ??
    payload.access_token ??
    payload.jwt ??
    payload.access ??
    asRecord(payload.auth).token ??
    asRecord(payload.session).token ??
    asRecord(payload.tokens).accessToken
  );
}

function pickUser(payload: Record<string, unknown>) {
  return asRecord(payload.userData ?? payload.user ?? payload.admin ?? payload.adminData ?? payload.currentAdmin ?? payload.profile ?? payload.data);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function persistAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("sherix_admin_token", session.token);
  window.localStorage.setItem("SHERIX_ADMIN_AT", session.token);
  window.localStorage.setItem("sherix_role", session.role);
  window.localStorage.setItem("sherix_session_expires_at", String(session.expiresAt));
  window.localStorage.setItem("sherix_device_id", DEVICE_ID);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("sherix_admin_token");
  window.localStorage.removeItem("SHERIX_ADMIN_AT");
  window.localStorage.removeItem("sherix_role");
  window.localStorage.removeItem("sherix_session_expires_at");
  window.sessionStorage.removeItem("sherix_admin_token");
  window.sessionStorage.removeItem("SHERIX_ADMIN_AT");
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthSession> {
    const response = await api.post(
      "/auth/login",
      input,
      {
        headers: {
          "x-device-id": DEVICE_ID,
        },
      },
    );

    const payload = asRecord(unwrapData<unknown>(response.data));
    const token = pickToken(payload);
    const rawUser = pickUser(payload);
    const role = String(rawUser.role ?? payload.role ?? "");
    const email = String(rawUser.email ?? input.email);
    const fullName = String(
      rawUser.fullName ??
      rawUser.name ??
      [rawUser.firstName, rawUser.lastName].filter(Boolean).join(" ") ??
      email.split("@")[0] ??
      "Admin",
    );
    const name = fullName || email.split("@")[0] || "Admin";

    if (typeof token !== "string" || !token) {
      throw new Error("Login succeeded but no access token was returned.");
    }

    if (!role) {
      throw new Error("Login succeeded but no user role was returned.");
    }

    return {
      token,
      role,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      user: {
        ...rawUser,
        email,
        name,
        fullName,
        role,
        initials: String(rawUser.initials ?? initials(name)),
      } as AuthUser,
    };
  },
};
