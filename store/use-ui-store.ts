"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type AuthSession, type AuthUser } from "@/services/auth";
import { clearProtectedQueryCache } from "@/lib/query-client";

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
        clearProtectedQueryCache();
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
       
        const sessionValid = Boolean(state.refreshToken && state.refreshTokenExpiresAt && state.refreshTokenExpiresAt > Date.now());
        if (!sessionValid) {
          state.signOut();
        }
      },
    },
  ),
);

