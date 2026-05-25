"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/use-ui-store";

export function SidebarItem({ route, compact = false }: { route: NavRoute; compact?: boolean }) {
  const pathname = usePathname();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const isActive = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(`${route.href}/`));
  const Icon = route.icon;

  return (
    <Link
      href={route.href}
      onClick={() => setSidebarOpen(false)}
      className={cn(
        "group flex h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-primary text-white shadow-md shadow-red-500/20"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
        compact && "justify-center px-0",
      )}
      aria-current={isActive ? "page" : undefined}
      title={compact ? route.title : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!compact && <span className="truncate">{route.title}</span>}
    </Link>
  );
}
