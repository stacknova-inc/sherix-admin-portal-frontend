"use client";

import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CardShell } from "@/components/shared/CardShell";

type RequestStatusItem = {
  name: string;
  value: number;
  percent: string;
  color: string;
};

export function RequestStatusDonut({
  data = [],
  total = "0",
  periodLabel,
}: {
  data?: RequestStatusItem[];
  total?: string;
  periodLabel?: string;
}) {
  return (
    <CardShell className="p-4 sm:p-5">
      <h2 className="text-base font-black tracking-normal">
        Request Status Distribution
      </h2>
      {periodLabel && <p className="text-xs text-muted-foreground">{periodLabel}</p>}

      <div className="relative mx-auto mt-4 h-48 max-w-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xl font-black">{total}</p>
            <p className="text-xs font-semibold text-muted-foreground">
              Total Requests
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="flex items-center gap-2 font-semibold">
              <i
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>

            <span className="text-muted-foreground">
              {item.value.toLocaleString()} ({item.percent})
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/requests"
        className="mt-4 inline-flex text-xs font-bold text-primary hover:underline"
      >
        View all requests
      </Link>
    </CardShell>
  );
}
