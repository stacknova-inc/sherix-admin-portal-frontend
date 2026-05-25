"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartRecord = Record<string, string | number>;

export function ComparisonLineChart({
  data,
  primaryKey = "thisPeriod",
  secondaryKey = "previous",
  height = 260,
}: {
  data: ChartRecord[];
  primaryKey?: string;
  secondaryKey?: string;
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip />
          <Line type="monotone" dataKey={primaryKey} stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} />
          <Line type="monotone" dataKey={secondaryKey} stroke="#64748B" strokeDasharray="4 4" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EarningsAreaChart({ data }: { data: ChartRecord[] }) {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${Number(value) / 1000}K`} />
          <Tooltip />
          <Line type="monotone" dataKey="provider" stroke="#16A34A" strokeWidth={3} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="commission" stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonBarChart({ data, height = 250 }: { data: ChartRecord[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip />
          <Bar dataKey="thisPeriod" fill="#2563EB" radius={[6, 6, 0, 0]} />
          <Bar dataKey="previous" fill="#BFDBFE" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  total,
  label,
  height = 220,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  total: string;
  label: string;
  height?: number;
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="84%" paddingAngle={1} stroke="transparent">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-xl font-black">{total}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
