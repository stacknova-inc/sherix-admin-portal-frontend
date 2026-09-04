"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ConnectivityBanner } from "@/components/shared/ConnectivityBanner";
import { canAccessPath } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/use-ui-store";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUiStore((state) => state.user);
  const refreshToken = useUiStore((state) => state.refreshToken);
  const refreshTokenExpiresAt = useUiStore((state) => state.refreshTokenExpiresAt);
  const signOut = useUiStore((state) => state.signOut);
  const role = useUiStore((state) => state.role);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(useUiStore.persist.hasHydrated());
    return useUiStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  useEffect(() => {
    if (!hasHydrated || !refreshTokenExpiresAt) return;

    const expireSession = () => {
      if (refreshTokenExpiresAt > Date.now()) return;
      signOut();
      router.replace("/sign-in?reason=session-expired");
    };

    expireSession();
    const interval = window.setInterval(expireSession, 30_000);
    return () => window.clearInterval(interval);
  }, [hasHydrated, refreshTokenExpiresAt, router, signOut]);

  useEffect(() => {
    if (!hasHydrated) return;

    const sessionValid = Boolean(user && refreshToken && refreshTokenExpiresAt && refreshTokenExpiresAt > Date.now());
    if (!sessionValid) {
      if (user || refreshToken) signOut();
      router.replace("/sign-in?reason=session-expired");
      return;
    }

    if (!canAccessPath(role ?? user?.role, pathname)) {
      router.replace("/dashboard/unauthorized");
    }
  }, [hasHydrated, pathname, refreshToken, refreshTokenExpiresAt, role, router, signOut, user]);

  function FullScreenSpinner() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
      </div>
    );
  }

  if (
    !hasHydrated ||
    !user ||
    !refreshToken ||
    !refreshTokenExpiresAt ||
    refreshTokenExpiresAt <= Date.now()
  ) {
    return <FullScreenSpinner />;
  }
  return (
    <div className="min-h-screen bg-background">
      <MobileSidebar />
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </div>
      <div className={cn("min-w-0 transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]")}>
        <Topbar />
        <ConnectivityBanner />
        <main className="min-w-0 px-3 py-4 sm:px-5 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
