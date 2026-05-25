"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CardShell } from "@/components/shared/CardShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jobsOverview } from "@/lib/mock-data";

export function JobsOverviewChart() {
  return (
    <CardShell className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black tracking-normal">Jobs Overview</h2>
          <p className="text-xs text-muted-foreground">Completed, active, and cancelled jobs</p>
        </div>
        <Select defaultValue="week">
          <SelectTrigger className="w-32" aria-label="Jobs overview date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={jobsOverview} margin={{ left: -18, right: 16, top: 8, bottom: 0 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }} />
            <Line type="monotone" dataKey="completed" name="Completed Jobs" stroke="#E30613" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="inProgress" name="In Progress" stroke="#FDA4AF" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="cancelled" name="Cancelled Jobs" stroke="#94A3B8" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-primary" />Completed Jobs</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-rose-300" />In Progress</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-slate-400" />Cancelled Jobs</span>
      </div>
    </CardShell>
  );
}
