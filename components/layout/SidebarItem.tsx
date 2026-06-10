// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import type { NavRoute } from "@/lib/routes";
// import { cn } from "@/lib/utils";
// import { useUiStore } from "@/store/use-ui-store";

// export function SidebarItem({ route, compact = false }: { route: NavRoute; compact?: boolean }) {
//   const pathname = usePathname();
//   const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
//   const isActive = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(`${route.href}/`));
//   const Icon = route.icon;

//   return (
//     <Link
//       href={route.href}
//       onClick={() => setSidebarOpen(false)}
//       className={cn(
//         "group flex h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
//         isActive
//           ? "bg-primary text-white shadow-md shadow-red-500/20"
//           : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
//         compact && "justify-center px-0",
//       )}
//       aria-current={isActive ? "page" : undefined}
//       title={compact ? route.title : undefined}
//     >
//       <Icon className="h-4 w-4 shrink-0" />
//       {!compact && <span className="truncate">{route.title}</span>}
//     </Link>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/use-ui-store";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function SidebarItem({ route, compact = false }: { route: NavRoute; compact?: boolean }) {
  const pathname = usePathname();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  const isActive =
    pathname === route.href ||
    (route.href !== "/dashboard" && pathname.startsWith(`${route.href}/`));

  const hasChildren = !!route.children?.length;
  const isChildActive = route.children?.some(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
  );

  const [open, setOpen] = useState(isChildActive ?? false);

  const Icon = route.icon;

  // Item with dropdown
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "group flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isChildActive
              ? "bg-primary text-white shadow-md shadow-red-500/20"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
            compact && "justify-center px-0"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!compact && (
            <>
              <span className="truncate flex-1 text-left">{route.title}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </>
          )}
        </button>

        {/* Dropdown children */}
        {open && !compact && (
          <div className="mt-0.5 ml-3 flex flex-col gap-0.5 border-l border-slate-200 pl-3 dark:border-white/10">
            {route.children!.map((child) => {
              const ChildIcon = child.icon;
              const childActive =
                pathname === child.href || pathname.startsWith(`${child.href}/`);

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded-md px-2 text-xs font-medium transition-colors",
                    childActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                  )}
                  aria-current={childActive ? "page" : undefined}
                >
                  <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{child.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Regular item (no children)
  return (
    <Link
      href={route.href}
      onClick={() => setSidebarOpen(false)}
      className={cn(
        "group flex h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-primary text-white shadow-md shadow-red-500/20"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
        compact && "justify-center px-0"
      )}
      aria-current={isActive ? "page" : undefined}
      title={compact ? route.title : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!compact && <span className="truncate">{route.title}</span>}
    </Link>
  );
}