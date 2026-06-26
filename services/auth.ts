import { api, unwrapData } from "@/lib/api";

export const ADMIN_PORTAL_ROLE = "sherix_admin";

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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface AuthSession extends AuthTokens {
  role: string;
  user: AuthUser;
}

const DEFAULT_ACCESS_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/**
 * Backend returns durations as strings like "24h" / "30d" rather than absolute
 * timestamps, so expiry has to be computed client-side from the duration it gives us
 * (instead of being invented outright, as the previous implementation did).
 */
function parseDurationMs(value: unknown, fallbackMs: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value * 1000; // numeric durations follow the JWT `expiresIn`-seconds convention
  }
  if (typeof value === "string") {
    const match = value.trim().match(/^(\d+)\s*(ms|s|m|h|d)$/i);
    if (match) {
      const amount = Number(match[1]);
      const unitMs = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2].toLowerCase() as "ms" | "s" | "m" | "h" | "d"];
      return amount * unitMs;
    }
  }
  console.warn("[Sherix Auth] Unable to parse token duration, using fallback", { value, fallbackMs });
  return fallbackMs;
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

/**
 * Shared by login and refresh: builds the token bundle from the backend's
 * { access_token, refresh_token, access_token_expires_in, refresh_token_expires_in } contract.
 * `previous` lets a refresh response that omits `refresh_token` (rotation behavior is
 * unconfirmed against the live backend) fall back to the refresh token already on hand
 * instead of silently dropping the session.
 */
function buildTokens(payload: Record<string, unknown>, previous?: AuthTokens): AuthTokens {
  const now = Date.now();
  const accessToken = String(payload.access_token ?? payload.accessToken ?? "");
  const refreshToken = String(payload.refresh_token ?? payload.refreshToken ?? previous?.refreshToken ?? "");

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: now + parseDurationMs(payload.access_token_expires_in ?? payload.accessTokenExpiresIn, DEFAULT_ACCESS_TOKEN_TTL_MS),
    refreshTokenExpiresAt: now + parseDurationMs(payload.refresh_token_expires_in ?? payload.refreshTokenExpiresIn, DEFAULT_REFRESH_TOKEN_TTL_MS),
  };
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthSession> {
    const response = await api.post("/auth/login", input, { skipAuthRefresh: true });
    const payload = asRecord(unwrapData<unknown>(response.data));
    const tokens = buildTokens(payload);
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

    if (!tokens.accessToken) {
      throw new Error("Login succeeded but no access token was returned.");
    }
    if (!tokens.refreshToken) {
      throw new Error("Login succeeded but no refresh token was returned.");
    }
    if (!role) {
      throw new Error("Login succeeded but no user role was returned.");
    }

    return {
      ...tokens,
      role,
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

  async refresh(refreshToken: string, previous: AuthTokens): Promise<AuthTokens> {
    const response = await api.post(
      "/auth/refresh-tokens",
      { refresh_token: refreshToken },
      { skipAuthRefresh: true },
    );
    const payload = asRecord(unwrapData<unknown>(response.data));
    const tokens = buildTokens(payload, previous);

    if (!tokens.accessToken) {
      throw new Error("Refresh succeeded but no access token was returned.");
    }

    return tokens;
  },
};
