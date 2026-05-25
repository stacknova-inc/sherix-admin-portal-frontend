import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { CardShell } from "@/components/shared/CardShell";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  red: "bg-red-100 text-primary dark:bg-red-500/15",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15",
  green: "bg-green-100 text-green-600 dark:bg-green-500/15",
};

export function StatCard({ label, value, change, icon: Icon, tone }: { label: string; value: string; change: string; icon: LucideIcon; tone: string }) {
  return (
    <CardShell className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-xl font-black tracking-normal">{value}</p>
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-green-600">
        <TrendingUp className="h-3 w-3" />
        {change}
      </p>
    </CardShell>
  );
}
