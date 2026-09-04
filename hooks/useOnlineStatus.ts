"use client";

import * as React from "react";
import { onlineManager, useQueryClient } from "@tanstack/react-query";

export type ConnectivityState = "online" | "offline" | "reconnecting";


export function useOnlineStatus() {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = React.useState(() => onlineManager.isOnline());
  const [state, setState] = React.useState<ConnectivityState>(() => (onlineManager.isOnline() ? "online" : "offline"));
  const wentOfflineAtRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return onlineManager.subscribe((online) => {
      setIsOnline(online);

      if (!online) {
        wentOfflineAtRef.current = Date.now();
        setState("offline");
        return;
      }

      setState("reconnecting");

      const wasOffline = wentOfflineAtRef.current !== null;
      wentOfflineAtRef.current = null;

      if (wasOffline) {
     
        void queryClient.refetchQueries({ type: "active" }).finally(() => setState("online"));
      } else {
        setState("online");
      }
    });
  }, [queryClient]);

  return { isOnline, state };
}
