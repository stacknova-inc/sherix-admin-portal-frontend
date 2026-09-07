"use client";

import * as React from "react";
import { onlineManager, useIsMutating, useQueryClient, type QueryKey } from "@tanstack/react-query";


export function useAutoRefresh(queryKeys: QueryKey[], intervalMs: number, enabled = true) {
  const queryClient = useQueryClient();
  const isMutating = useIsMutating();
  const keysRef = React.useRef(queryKeys);
  keysRef.current = queryKeys;

  React.useEffect(() => {
    if (!enabled) return;

    function tick() {
      if (!onlineManager.isOnline()) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (isMutating > 0) return;

      for (const queryKey of keysRef.current) {
        void queryClient.invalidateQueries({ queryKey, refetchType: "active" });
      }
    }

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, isMutating, queryClient]);
}
