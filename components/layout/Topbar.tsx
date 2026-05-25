"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePickerButton } from "@/components/shared/DateRangePickerButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { useUiStore } from "@/store/use-ui-store";

export function Topbar() {
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-5 lg:justify-end lg:px-6">
      <Button variant="outline" size="icon" className="bg-card lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2 sm:gap-3">
        <DateRangePickerButton />
        <Button variant="outline" size="icon" className="relative bg-card" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-black text-white">12</span>
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
