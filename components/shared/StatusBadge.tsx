import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  Active: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Ongoing: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Completed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Inactive: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Suspended: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Verified: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  "Under Review": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Open: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Resolved: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Paid: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Unpaid: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Refunded: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Sent: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Draft: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  Published: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Flagged: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Success: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Failed: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const displayStatus = status.toLowerCase() === "banned" ? "Suspended" : status;

  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold", statusClasses[displayStatus] ?? statusClasses.Draft, className)}>
      {displayStatus}
    </span>
  );
}
