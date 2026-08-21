"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CardShell } from "@/components/shared/CardShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const RANGE_OPTIONS = [
  { value: "7D", label: "Last 7 days" },
  { value: "30D", label: "Last 30 days" },
  { value: "90D", label: "Last 90 days" },
];

export function RequestsOverviewChart({
  data,
  range,
  onRangeChange,
}: {
  data?: Array<Record<string, string | number>>;
  range?: string;
  onRangeChange?: (range: string) => void;
}) {
  return (
    <CardShell className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black tracking-normal">Requests Overview</h2>
          <p className="text-xs text-muted-foreground">Completed, in progress, expired, and cancelled requests</p>
        </div>
        {range && onRangeChange && (
          <Select value={range} onValueChange={onRangeChange}>
            <SelectTrigger className="h-9 w-[150px] bg-card text-xs font-semibold" aria-label="Select reporting period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -18, right: 16, top: 8, bottom: 0 }} barGap={6} barCategoryGap="26%">
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 8" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
            />
            <Bar dataKey="completed" name="Completed Requests" fill="#E30613" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="inProgress" name="In Progress" fill="#FDA4AF" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expired" name="Expired Requests" fill="#FB923C" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="cancelled" name="Cancelled Requests" fill="#94A3B8" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-primary" />Completed Requests</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-rose-300" />In Progress</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-orange-400" />Expired Requests</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-slate-400" />Cancelled Requests</span>
      </div>
    </CardShell>
  );
}
