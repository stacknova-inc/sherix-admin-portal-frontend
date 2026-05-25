"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import { DonutChart, EarningsAreaChart } from "@/components/shared/AdminCharts";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { InitialAvatar, MetricGrid, SectionHeader, StatusCell } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  earningsChart,
  earningsDistribution,
  earningsMetrics,
  recentPayouts,
  topEarningProviders,
} from "@/lib/mock-data";

type PayoutRow = (typeof recentPayouts)[number];

const payoutColumns: ColumnDef<PayoutRow>[] = [
  { accessorKey: "id", header: "Payout ID", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <InitialAvatar initials={row.original.initials} className="bg-black text-white" />
        <span className="font-bold">{row.original.provider}</span>
      </div>
    ),
  },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className="font-black">{row.original.amount}</span> },
  { accessorKey: "method", header: "Method" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
];

export default function EarningsPaymentsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Earnings & Payments" subtitle="Track earnings, commissions and manage payouts." />
      <MetricGrid metrics={earningsMetrics} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.95fr)]">
        <CardShell className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-black">Earnings Overview</h2>
            <Button variant="outline" className="bg-card">
              This Week
            </Button>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-4 text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-600" />
              Provider Earnings <span>GHS 118,325</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              Platform Commission <span>GHS 10,215</span>
            </span>
          </div>
          <EarningsAreaChart data={earningsChart} />
        </CardShell>

        <CardShell className="p-4">
          <h2 className="text-base font-black">Earnings Distribution</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
            <DonutChart data={earningsDistribution} total="GHS 128,540" label="Total" />
            <div className="space-y-5">
              {earningsDistribution.map((item) => (
                <div key={item.name} className="grid grid-cols-[1fr_64px_110px] items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="text-right text-muted-foreground">{item.percent}</span>
                  <span className="text-right font-black">GHS {item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex gap-3 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-slate-700 dark:bg-blue-500/10 dark:text-blue-100">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                Platform commission is 8% of job amount excluding tax and discounts.
              </div>
            </div>
          </div>
        </CardShell>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
        <CardShell className="p-4">
          <SectionHeader title="Recent Payouts" />
          <AdminDataTable data={recentPayouts} columns={payoutColumns} minWidth="780px" />
          <p className="mt-4 text-sm text-muted-foreground">Showing 1 to 5 of 20 payouts</p>
        </CardShell>

        <CardShell className="p-4">
          <SectionHeader title="Top Earning Providers" />
          <div className="overflow-hidden rounded-2xl border">
            {topEarningProviders.map((provider) => (
              <div key={provider.rank} className="grid grid-cols-[48px_minmax(170px,1fr)_140px_120px] items-center gap-3 border-b p-4 text-sm last:border-0">
                <span className="font-black">{provider.rank}</span>
                <div className="flex items-center gap-3">
                  <InitialAvatar initials={provider.initials} className="bg-black text-white" />
                  <span className="font-bold">{provider.provider}</span>
                </div>
                <span className="font-black">{provider.earnings}</span>
                <span className="font-semibold text-muted-foreground">{provider.jobs}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Showing 1 to 5 of 50 providers</p>
        </CardShell>
      </section>
    </div>
  );
}
