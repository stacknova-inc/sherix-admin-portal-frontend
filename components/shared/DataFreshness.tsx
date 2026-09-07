"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatUpdatedAt(dataUpdatedAt: number) {
  if (!dataUpdatedAt) return "";
  return new Date(dataUpdatedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}


 
export function DataFreshness({
  isFetching,
  dataUpdatedAt,
  isRefreshError,
  onRetry,
  className,
}: {
  isFetching: boolean;
  dataUpdatedAt: number;
  isRefreshError?: boolean;
  onRetry?: () => void;
  className?: string;
}) {
  if (isRefreshError) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600", className)}>
        <AlertTriangle className="h-3.5 w-3.5" />
        Refresh failed — showing last confirmed data.
        {onRetry && (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold text-amber-700" onClick={onRetry}>
            Retry
          </Button>
        )}
      </span>
    );
  }

  if (isFetching) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground", className)}>
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        Updating…
      </span>
    );
  }

  if (!dataUpdatedAt) return null;

  return <span className={cn("text-xs font-semibold text-muted-foreground", className)}>Last updated {formatUpdatedAt(dataUpdatedAt)}</span>;
}
