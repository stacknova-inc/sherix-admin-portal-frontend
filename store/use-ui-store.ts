"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADMIN_PORTAL_ROLE, authApi, clearAuthSession, persistAuthSession, type AuthSession, type AuthUser } from "@/services/auth";

type UiStore = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  user: AuthUser | null;
  token: string | null;
  role: string | null;
  isAuthenticating: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  login: (email: string, password: string) => Promise<AuthSession>;
  setSession: (session: AuthSession) => void;
  signOut: () => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      user: null,
      token: null,
      role: null,
      isAuthenticating: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSession: (session) => {
        persistAuthSession(session);
        set({ token: session.token, role: session.role, user: session.user, isAuthenticating: false });
      },
      login: async (email, password) => {
        set({ isAuthenticating: true });
        try {
          const session = await authApi.login({ email, password });
          if (session.role !== ADMIN_PORTAL_ROLE) {
            clearAuthSession();
            set({ user: null, token: null, role: null, isAuthenticating: false, sidebarOpen: false });
            throw new Error("This portal is only available to Sherix administrators.");
          }
          persistAuthSession(session);
          set({ token: session.token, role: session.role, user: session.user, isAuthenticating: false });
          return session;
        } catch (error) {
          set({ isAuthenticating: false });
          throw error;
        }
      },
      signOut: () => {
        clearAuthSession();
        set({ user: null, token: null, role: null, sidebarOpen: false });
      },
    }),
    {
      name: "sherix-ui",
      partialize: (state) => ({ user: state.user, token: state.token, role: state.role, sidebarCollapsed: state.sidebarCollapsed }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.token && state.role && state.user) {
          persistAuthSession({ token: state.token, role: state.role, user: state.user });
        }
      },
    },
  ),
);
