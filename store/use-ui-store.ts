"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADMIN_USER } from "@/lib/constants";

type AuthUser = typeof ADMIN_USER;

type UiStore = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  user: AuthUser | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  signIn: (email: string) => void;
  signOut: () => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      user: null,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      signIn: (email) => set({ user: { ...ADMIN_USER, email: email || ADMIN_USER.email } }),
      signOut: () => set({ user: null, sidebarOpen: false }),
    }),
    {
      name: "sherix-ui",
      partialize: (state) => ({ user: state.user, sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
