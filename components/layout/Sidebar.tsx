"use client";

import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { SidebarItem } from "@/components/layout/SidebarItem";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/hooks/useAuth";
import { filterRoutesForRole } from "@/lib/rbac";
import { dashboardRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/use-ui-store";

export function Sidebar({ className }: { className?: string }) {
  const router = useRouter();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleCollapsed = useUiStore((state) => state.toggleSidebarCollapsed);
  const logoutMutation = useLogout();
  const user = useUiStore((state) => state.user);
  const role = useUiStore((state) => state.role);
  const visibleRoutes = filterRoutesForRole(dashboardRoutes, role ?? user?.role);

  async function logout() {
    try {
      await logoutMutation.mutateAsync();
    } catch {
     
    } finally {
      router.replace("/sign-in");
    }
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-white text-slate-950 dark:bg-[#06111F] dark:text-white",
        collapsed ? "w-[76px]" : "w-[260px]",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        <BrandLogo compact={collapsed} />
        {!collapsed && (
          <Button aria-label="Collapse sidebar" variant="ghost" size="icon" onClick={toggleCollapsed} className="hidden lg:inline-flex">
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        )}
        {collapsed && (
          <Button aria-label="Expand sidebar" variant="ghost" size="icon" onClick={toggleCollapsed} className="hidden lg:inline-flex">
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {visibleRoutes.map((route) => (
            <SidebarItem key={route.href} route={route} compact={collapsed} />
          ))}
        </nav>
      </ScrollArea>
      <div className="space-y-3 border-t p-3">
        <div className={cn("flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 dark:bg-white/5", collapsed && "justify-center p-2")}>
          <Avatar>
            <AvatarFallback>{user?.initials ?? "AD"}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user?.name ?? "Admin"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? "admin@sherix.com"}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-muted-foreground hover:text-primary", collapsed && "justify-center px-0")}
          onClick={logout}
          disabled={logoutMutation.isPending}
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && (logoutMutation.isPending ? "Logging out..." : "Logout")}
        </Button>
      </div>
    </aside>
  );
}

