"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Mail,
  MessageSquare,
  MoreVertical,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { CardShell } from "@/components/shared/CardShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  red: "bg-red-100 text-primary dark:bg-red-500/15 dark:text-red-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  green: "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
};

export type MetricItem = {
  label: string;
  value: string;
  change: string;
  direction?: string;
  tone?: string;
  icon: LucideIcon;
};

export function MetricGrid({ metrics, columns = "xl:grid-cols-5" }: { metrics: MetricItem[]; columns?: string }) {
  return (
    <section className={cn("grid gap-3 sm:grid-cols-2", columns)}>
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}

export function MetricCard({ metric, className }: { metric: MetricItem; className?: string }) {
  const Icon = metric.icon;
  const isDown = metric.direction === "down";
  const TrendIcon = isDown ? TrendingDown : TrendingUp;

  return (
    <CardShell className={cn("p-4", className)}>
      <div className="flex items-start gap-3">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneClasses[metric.tone ?? "red"])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
          <p className="mt-1.5 truncate text-xl font-black tracking-normal">{metric.value}</p>
          <p className={cn("mt-2 flex items-center gap-1 text-[11px] font-bold", isDown ? "text-red-600" : "text-green-600")}>
            <TrendIcon className="h-3 w-3" />
            {metric.change}
          </p>
        </div>
      </div>
    </CardShell>
  );
}

export function ToolbarCard({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2.5 border-b p-3 lg:flex-row lg:items-center">{children}</div>;
}

export function SearchBox({
  placeholder,
  className,
  value,
  onChange,
}: {
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input className="bg-card pl-9" placeholder={placeholder} value={value} onChange={(event) => onChange?.(event.target.value)} />
    </div>
  );
}

export function FilterSelect({
  placeholder,
  values,
  className,
  value,
  onChange,
}: {
  placeholder: string;
  values: string[];
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Select defaultValue={values[0] ?? placeholder} value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 w-full bg-card   lg:w-[150px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {values.map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}



export function ExportButton() {
  return (
    <Button variant="outline" className="bg-card">
      <Download className="h-4 w-4" />
      Export
    </Button>
  );
}

export function ActionMenu({ detailHref }: { detailHref?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open action menu">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {detailHref ? (
          <DropdownMenuItem asChild>
            <Link href={detailHref}>
              <Eye className="h-4 w-4" />
              View details
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Eye className="h-4 w-4" />
            View details
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Suspend</DropdownMenuItem>
        <DropdownMenuItem >Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function InitialAvatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-[10px] font-black text-white", className)}>
      {initials}
    </span>
  );
}

export function PersonCell({
  name,
  sub,
  initials,
  avatarTone,
}: {
  name: string;
  sub?: string;
  initials: string;
  avatarTone?: string;
}) {
  return (
    <div className="flex min-w-[160px] items-center gap-2.5">
      <InitialAvatar initials={initials} className={avatarTone} />
      <div className="min-w-0">
        <p className="truncate font-bold">{name}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export function SoftTag({ children, tone = "blue" }: { children: React.ReactNode; tone?: string }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold", toneClasses[tone])}>{children}</span>;
}

export function ServiceTags({ services, extra = 0 }: { services: string[]; extra?: number }) {
  return (
    <div className="flex min-w-[170px] flex-wrap gap-1.5">
      {services.map((service) => (
        <span key={service} className="rounded-lg border bg-muted/60 px-2 py-1 text-xs font-semibold">
          {service}
        </span>
      ))}
      {extra > 0 && <span className="rounded-lg border bg-muted/60 px-2 py-1 text-xs font-semibold">+{extra}</span>}
    </div>
  );
}

export function RatingStars({ rating, showValue = true }: { rating: number; showValue?: boolean }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn("h-3.5 w-3.5", index < filled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700")}
          />
        ))}
      </div>
      {showValue && <span className="text-xs font-bold">{rating.toFixed(1)}</span>}
    </div>
  );
}

export function StatusCell({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

export function PaginationFooter({
  label,
  pageCount = "1",
  pageSize = false,
  currentPage = 1,
  onPageChange,
}: {
  label: string;
  pageCount?: string;
  pageSize?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}) {
  const totalPages = Math.max(1, Number(pageCount) || 1);
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
    const windowStart = Math.min(Math.max(1, currentPage - 2), Math.max(1, totalPages - 4));
    return windowStart + index;
  });

  return (
    <div className="flex flex-col gap-3 border-t p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>{label}</p>
      <div className="flex flex-wrap items-center gap-2 text-foreground">
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((page) => (
          <Button key={page} variant={page === currentPage ? "default" : "ghost"} size="icon" className="h-7 w-7 rounded-md" onClick={() => onPageChange?.(page)}>
            {page}
          </Button>
        ))}
        {totalPages > pages[pages.length - 1] && <span className="px-2 text-muted-foreground">...</span>}
        {totalPages > pages[pages.length - 1] && (
          <Button variant="ghost" className="h-7 rounded-md px-2" onClick={() => onPageChange?.(totalPages)}>
            {totalPages}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage >= totalPages} onClick={() => onPageChange?.(currentPage + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        {pageSize && (
          <Button variant="outline" className="h-8 bg-card">
            10 / page
          </Button>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({ title, action = "View All" }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-black tracking-normal">{title}</h2>
      <Button variant="link" className="h-auto p-0 text-xs font-black text-primary">
        {action}
      </Button>
    </div>
  );
}

export function ProgressRow({ label, value, percent, width, color }: { label: string; value: string | number; percent: string; width: number; color: string }) {
  return (
    <div className="grid grid-cols-[88px_minmax(80px,1fr)_94px] items-center gap-3 text-xs">
      <span className="font-semibold text-muted-foreground">{label}</span>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
      <span className="text-right font-bold">
        {value} <span className="text-muted-foreground">({percent})</span>
      </span>
    </div>
  );
}

export function ChannelIcons({ channels }: { channels: string[] }) {
  return (
    <div className="flex gap-1.5">
      {channels.map((channel) => {
        const Icon = channel === "Email" ? Mail : channel === "SMS" ? MessageSquare : Bell;
        const tone = channel === "Email" ? "blue" : channel === "SMS" ? "green" : "amber";
        return (
          <span key={channel} className={cn("grid h-6 w-6 place-items-center rounded-md", toneClasses[tone])} title={channel}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        );
      })}
    </div>
  );
}
