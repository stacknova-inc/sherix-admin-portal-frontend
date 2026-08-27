"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CardShell } from "@/components/shared/CardShell";
import { money } from "@/lib/live-data";


export function RevenueOverview({
  data = [],
  total = "0",
  periodLabel = "Live backend data",
}: {
  data?: Array<Record<string, string | number>>;
  total?: string;
  periodLabel?: string;
}) {
  return (
    <CardShell className="p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-black tracking-normal">Revenue Overview</h2>
          <p className="mt-1.5 text-xl font-black">{total}</p>
          <p className="mt-1 text-xs font-bold text-green-600">{periodLabel}</p>
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <Tooltip formatter={(value) => [money(value), "Revenue"]} contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }} />
            <Bar dataKey="revenue" fill="#E30613" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardShell>
  );
}
