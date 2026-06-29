"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADMIN_PORTAL_ROLE, authApi, type AuthSession, type AuthUser } from "@/services/auth";

type UiStore = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
  isAuthenticating: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  login: (email: string, password: string) => Promise<AuthSession>;
  /** Called by the Axios response interceptor on a 401 to silently renew the session. */
  refreshSession: () => Promise<string>;
  signOut: () => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      isAuthenticating: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      login: async (email, password) => {
        set({ isAuthenticating: true });
        try {
          const session = await authApi.login({ email, password });
          if (session.role !== ADMIN_PORTAL_ROLE) {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              role: null,
              accessTokenExpiresAt: null,
              refreshTokenExpiresAt: null,
              isAuthenticating: false,
              sidebarOpen: false,
            });
            throw new Error("This portal is only available to Sherix administrators.");
          }
          set({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            accessTokenExpiresAt: session.accessTokenExpiresAt,
            refreshTokenExpiresAt: session.refreshTokenExpiresAt,
            role: session.role,
            user: session.user,
            isAuthenticating: false,
          });
          return session;
        } catch (error) {
          set({ isAuthenticating: false });
          throw error;
        }
      },
      refreshSession: async () => {
        const { refreshToken, accessToken, accessTokenExpiresAt, refreshTokenExpiresAt } = get();
        if (!refreshToken) {
          throw new Error("No refresh token available.");
        }
        const tokens = await authApi.refresh(refreshToken, {
          accessToken: accessToken ?? "",
          refreshToken,
          accessTokenExpiresAt: accessTokenExpiresAt ?? 0,
          refreshTokenExpiresAt: refreshTokenExpiresAt ?? 0,
        });
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt,
          refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        });
        return tokens.accessToken;
      },
      signOut: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          role: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          sidebarOpen: false,
        });
      },
    }),
    {
      name: "sherix-ui",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // The access token is allowed to be stale on rehydration — the Axios interceptor
        // will silently refresh it on the first 401. Only an expired/missing *refresh*
        // token means the session itself is actually over.
        const sessionValid = Boolean(state.refreshToken && state.refreshTokenExpiresAt && state.refreshTokenExpiresAt > Date.now());
        if (!sessionValid) {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.role = null;
          state.accessTokenExpiresAt = null;
          state.refreshTokenExpiresAt = null;
        }
      },
    },
  ),
);
