"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CardShell } from "@/components/shared/CardShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { revenueOverview } from "@/lib/mock-data";

export function RevenueOverview() {
  return (
    <CardShell className="p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-black tracking-normal">Revenue Overview</h2>
          <p className="mt-1.5 text-xl font-black">GHS 128,540</p>
          <p className="mt-1 text-xs font-bold text-green-600">+15.4% vs last week</p>
        </div>
        <Select defaultValue="week">
          <SelectTrigger className="w-32" aria-label="Revenue date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueOverview} margin={{ left: -18, right: 8, top: 8 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <Tooltip formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }} />
            <Bar dataKey="revenue" fill="#E30613" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardShell>
  );
}
