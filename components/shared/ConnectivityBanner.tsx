"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { cn } from "@/lib/utils";

export function ConnectivityBanner() {
  const { state } = useOnlineStatus();

  if (state === "online") return null;

  const isOffline = state === "offline";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-bold text-white",
        isOffline ? "bg-red-600" : "bg-blue-600",
      )}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          You&apos;re offline — showing the last confirmed data. Changes can&apos;t be saved until connectivity returns.
        </>
      ) : (
        <>
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Back online — refreshing…
        </>
      )}
    </div>
  );
}
