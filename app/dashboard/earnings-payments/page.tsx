"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import { DonutChart, EarningsAreaChart } from "@/components/shared/AdminCharts";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { InitialAvatar, MetricGrid, SectionHeader, StatusCell } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useFinancialEarnings } from "@/hooks/useFinancial";
import { asRecord, firstText, initials, metricValue, money } from "@/lib/live-data";
import { CheckCircle2, Clock3, DollarSign, Wallet, WalletCards } from "lucide-react";

type PayoutRow = {
  id: string;
  provider: string;
  initials: string;
  amount: string;
  method: string;
  date: string;
  status: string;
};

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
  const earningsQuery = useFinancialEarnings();
  const earnings = asRecord(earningsQuery.data);
  const chartData = (Array.isArray(earnings.chart) ? earnings.chart : Array.isArray(earnings.earningsChart) ? earnings.earningsChart : []) as Record<string, string | number>[];
  const payouts = (Array.isArray(earnings.recentPayouts) ? earnings.recentPayouts : Array.isArray(earnings.payouts) ? earnings.payouts : []) as Record<string, unknown>[];
  const payoutRows: PayoutRow[] = payouts.map((payout) => {
    const provider = firstText(payout, ["provider", "providerName", "company"], "Provider");
    return {
      id: firstText(payout, ["id", "_id", "payoutId"]),
      provider,
      initials: initials(provider),
      amount: money(payout.amount),
      method: firstText(payout, ["method", "paymentMethod"]),
      date: firstText(payout, ["date", "createdAt"]),
      status: firstText(payout, ["status"], "Pending"),
    };
  });
  const distribution = [
    { name: "Provider Payouts", value: Number(earnings.providerEarnings ?? earnings.providerPayouts ?? 0), percent: "", color: "#16A34A" },
    { name: "Platform Commission", value: Number(earnings.platformCommission ?? earnings.commission ?? 0), percent: "", color: "#2563EB" },
    { name: "Pending Payouts", value: Number(earnings.pendingPayouts ?? 0), percent: "", color: "#F59E0B" },
  ].filter((item) => item.value > 0);
  const metrics = [
    { label: "Total Earnings", value: money(earnings.totalEarnings ?? earnings.total), change: "Live backend data", direction: "up", tone: "green", icon: Wallet },
    { label: "Platform Commission", value: money(earnings.platformCommission ?? earnings.commission), change: "Live backend data", direction: "up", tone: "purple", icon: DollarSign },
    { label: "Provider Earnings", value: money(earnings.providerEarnings ?? earnings.providerPayouts), change: "Live backend data", direction: "up", tone: "blue", icon: WalletCards },
    { label: "Pending Payouts", value: money(earnings.pendingPayouts), change: "Live backend data", direction: "down", tone: "amber", icon: Clock3 },
    { label: "Paid This Month", value: money(earnings.paidThisMonth), change: "Live backend data", direction: "up", tone: "teal", icon: CheckCircle2 },
  ];
  const topProviders = (Array.isArray(earnings.topEarningProviders) ? earnings.topEarningProviders : []) as Record<string, unknown>[];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Earnings & Payments" subtitle="Track earnings, commissions and manage payouts." />
      <MetricGrid metrics={metrics} />

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
              Provider Earnings <span>{money(earnings.providerEarnings ?? earnings.providerPayouts)}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              Platform Commission <span>{money(earnings.platformCommission ?? earnings.commission)}</span>
            </span>
          </div>
          {earningsQuery.isLoading ? <div className="h-[280px] animate-pulse rounded-xl bg-muted" /> : chartData.length ? <EarningsAreaChart data={chartData} /> : <p className="py-12 text-center text-sm font-semibold text-muted-foreground">No earnings analytics available yet.</p>}
        </CardShell>

        <CardShell className="p-4">
          <h2 className="text-base font-black">Earnings Distribution</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
            <DonutChart data={distribution.length ? distribution : [{ name: "No earnings", value: 1, color: "#CBD5E1" }]} total={money(earnings.totalEarnings ?? earnings.total)} label="Total" />
            <div className="space-y-5">
              {distribution.map((item) => (
                <div key={item.name} className="grid grid-cols-[1fr_64px_110px] items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="text-right text-muted-foreground">{item.percent}</span>
                  <span className="text-right font-black">{money(item.value)}</span>
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
          {earningsQuery.isLoading ? <div className="p-6 text-sm font-semibold text-muted-foreground">Loading payouts...</div> : <AdminDataTable data={payoutRows} columns={payoutColumns} minWidth="780px" />}
          <p className="mt-4 text-sm text-muted-foreground">Showing {payoutRows.length ? `1 to ${payoutRows.length}` : "0"} of {payoutRows.length} payouts</p>
        </CardShell>

        <CardShell className="p-4">
          <SectionHeader title="Top Earning Providers" />
          <div className="overflow-hidden rounded-2xl border">
            {topProviders.map((provider, index) => {
              const providerName = firstText(provider, ["provider", "name", "companyName"], "Provider");
              return (
              <div key={`${providerName}-${index}`} className="grid grid-cols-[48px_minmax(170px,1fr)_140px_120px] items-center gap-3 border-b p-4 text-sm last:border-0">
                <span className="font-black">{index + 1}</span>
                <div className="flex items-center gap-3">
                  <InitialAvatar initials={initials(providerName)} className="bg-black text-white" />
                  <span className="font-bold">{providerName}</span>
                </div>
                <span className="font-black">{money(provider.earnings ?? provider.totalEarnings)}</span>
                <span className="font-semibold text-muted-foreground">{metricValue(provider, ["jobs", "completedJobs"], "0")}</span>
              </div>
            )})}
          </div>
          {!topProviders.length && <p className="py-8 text-center text-sm font-semibold text-muted-foreground">No top earning providers yet.</p>}
        </CardShell>
      </section>
    </div>
  );
}
