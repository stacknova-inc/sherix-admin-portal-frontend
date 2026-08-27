import type { LucideIcon } from "lucide-react";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { CardShell } from "@/components/shared/CardShell";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  red: "bg-red-100 text-primary dark:bg-red-500/15",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15",
  green: "bg-green-100 text-green-600 dark:bg-green-500/15",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/15",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-500/15",
};

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone: string;
  direction?: "up" | "down";
  href?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export function StatCard({ label, value, change, icon: Icon, tone, direction = "up", href, isLoading, isError, onRetry }: StatCardProps) {
  const TrendIcon = direction === "down" ? TrendingDown : TrendingUp;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          {isLoading ? (
            <div className="mt-2.5 h-6 w-20 animate-pulse rounded-md bg-muted" aria-hidden="true" />
          ) : isError ? (
            <p className="mt-2 text-sm font-bold text-red-600">Unavailable</p>
          ) : (
            <p className="mt-2 truncate text-xl font-black tracking-normal">{value}</p>
          )}
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneClasses[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {isLoading ? (
        <div className="mt-3 h-3 w-24 animate-pulse rounded bg-muted" aria-hidden="true" />
      ) : isError ? (
        <div className="mt-3 flex items-center gap-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-red-600">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            Unable to load this metric
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onRetry();
              }}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <p className={cn("mt-3 flex items-center gap-1.5 text-[11px] font-bold", direction === "down" ? "text-red-600" : "text-green-600")}>
          <TrendIcon className="h-3 w-3" aria-hidden="true" />
          {change}
        </p>
      )}
    </>
  );

  if (href) {
    return (
      <CardShell className="p-4 transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-primary">
        <Link href={href} className="block outline-none" aria-label={`${label}: ${isLoading ? "loading" : isError ? "unavailable" : value}. View details.`}>
          {body}
        </Link>
      </CardShell>
    );
  }

  return (
    <CardShell className="p-4">
      <div aria-label={`${label}: ${isLoading ? "loading" : isError ? "unavailable" : value}`}>{body}</div>
    </CardShell>
  );
}
