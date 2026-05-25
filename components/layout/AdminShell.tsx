"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/use-ui-store";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUiStore((state) => state.user);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(useUiStore.persist.hasHydrated());
    return useUiStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/sign-in");
    }
  }, [hasHydrated, router, user]);

  if (!hasHydrated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileSidebar />
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </div>
      <div className={cn("min-w-0 transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]")}>
        <Topbar />
        <main className="min-w-0 px-3 py-4 sm:px-5 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
