"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUiStore } from "@/store/use-ui-store";

export function MobileSidebar() {
  const open = useUiStore((state) => state.sidebarOpen);
  const setOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-[270px] border-0 p-0">
        <Sidebar className="w-full" />
      </SheetContent>
    </Sheet>
  );
}
