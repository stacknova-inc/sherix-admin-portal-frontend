"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity, BarChart3, Briefcase, DollarSign, FileText, ShieldCheck, Users, Wallet } from "lucide-react";
import { ComparisonLineChart, DonutChart } from "@/components/shared/AdminCharts";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { MetricGrid, SoftTag } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuditLogs } from "@/hooks/useAudit";
import { useBookingStats, useBookings } from "@/hooks/useBookings";
import { useCompanies } from "@/hooks/useCompanies";
import { useFinancialEarnings, useTransactions } from "@/hooks/useFinancial";
import { useUsers } from "@/hooks/useUsers";
import { asRecord, firstText, metricValue, money } from "@/lib/live-data";

type ReportSourceRow = {
  id: string;
  source: string;
  category: string;
  records: string;
  status: string;
  updated: string;
};

const categoryTone: Record<string, string> = {
  Financial: "green",
  Jobs: "blue",
  Users: "purple",
  Providers: "amber",
  Audit: "red",
};

function numberFromMetric(stats: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = asRecord(stats[key]).value ?? stats[key];
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

const sourceColumns: ColumnDef<ReportSourceRow>[] = [
  { accessorKey: "id", header: "#", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  { accessorKey: "source", header: "Backend Data Source", cell: ({ row }) => <span className="font-bold">{row.original.source}</span> },
  { accessorKey: "category", header: "Category", cell: ({ row }) => <SoftTag tone={categoryTone[row.original.category]}>{row.original.category}</SoftTag> },
  { accessorKey: "records", header: "Available Records", cell: ({ row }) => <span className="font-black">{row.original.records}</span> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <SoftTag tone={row.original.status === "Loaded" ? "green" : "amber"}>{row.original.status}</SoftTag> },
  { accessorKey: "updated", header: "Last Updated" },
];

export default function ReportsAnalyticsPage() {
  const usersQuery = useUsers();
  const companiesQuery = useCompanies();
  const bookingsQuery = useBookings();
  const bookingStatsQuery = useBookingStats();
  const earningsQuery = useFinancialEarnings();
  const transactionsQuery = useTransactions();
  const auditQuery = useAuditLogs();
  const bookingStats = asRecord(bookingStatsQuery.data);
  const earnings = asRecord(earningsQuery.data);
  const users = usersQuery.data ?? [];
  const companies = companiesQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];
  const auditEvents = auditQuery.data ?? [];
  const totalJobs = numberFromMetric(bookingStats, ["totalRequests", "totalBookings", "total"]) || bookings.length;
  const completedJobs = numberFromMetric(bookingStats, ["completedJobs", "completed"]);
  const pendingJobs = numberFromMetric(bookingStats, ["pendingRequests", "pending"]);
  const inProgressJobs = numberFromMetric(bookingStats, ["inProgress", "ongoing"]);
  const cancelledJobs = numberFromMetric(bookingStats, ["cancelledJobs", "cancelled"]);
  const transactionTotal = transactions.reduce((sum, transaction) => sum + Number((transaction as Record<string, unknown>).amount ?? 0), 0);
  const revenueTotal = earnings.totalEarnings ?? earnings.total ?? earnings.revenue ?? transactionTotal;
  const chartData = (Array.isArray(earnings.chart) ? earnings.chart : Array.isArray(earnings.earningsChart) ? earnings.earningsChart : []) as Array<Record<string, string | number>>;
  const jobStatus = [
    { name: "Completed", value: completedJobs, color: "#16A34A" },
    { name: "In Progress", value: inProgressJobs, color: "#2563EB" },
    { name: "Pending", value: pendingJobs, color: "#F59E0B" },
    { name: "Cancelled", value: cancelledJobs, color: "#DC2626" },
  ].filter((item) => item.value > 0);
  const sourceRows: ReportSourceRow[] = [
    { id: "users", source: "/users", category: "Users", records: String(users.length), status: usersQuery.isSuccess ? "Loaded" : usersQuery.isLoading ? "Loading" : "Unavailable", updated: new Date().toLocaleString() },
    { id: "providers", source: "/users/service-providers", category: "Providers", records: String(companies.length), status: companiesQuery.isSuccess ? "Loaded" : companiesQuery.isLoading ? "Loading" : "Unavailable", updated: new Date().toLocaleString() },
    { id: "bookings", source: "/bookings/admin/bookings", category: "Jobs", records: String(bookings.length), status: bookingsQuery.isSuccess ? "Loaded" : bookingsQuery.isLoading ? "Loading" : "Unavailable", updated: new Date().toLocaleString() },
    { id: "transactions", source: "/financial/transactions", category: "Financial", records: String(transactions.length), status: transactionsQuery.isSuccess ? "Loaded" : transactionsQuery.isLoading ? "Loading" : "Unavailable", updated: new Date().toLocaleString() },
    { id: "audit", source: "/audit/", category: "Audit", records: String(auditEvents.length), status: auditQuery.isSuccess ? "Loaded" : auditQuery.isLoading ? "Loading" : "Unavailable", updated: new Date().toLocaleString() },
  ];
  const metrics = [
    { label: "Users", value: String(users.length), change: "Loaded user records", direction: "up", tone: "purple", icon: Users },
    { label: "Service Providers", value: String(companies.length), change: "Loaded provider records", direction: "up", tone: "amber", icon: ShieldCheck },
    { label: "Total Jobs", value: String(totalJobs), change: metricValue(bookingStats, ["totalRequests", "totalBookings", "total"], "Booking stats"), direction: "up", tone: "blue", icon: Briefcase },
    { label: "Revenue", value: money(revenueTotal), change: "Financial earnings/transactions", direction: "up", tone: "green", icon: DollarSign },
    { label: "Transactions", value: String(transactions.length), change: "Loaded transaction records", direction: "up", tone: "teal", icon: Wallet },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Reports & Analytics" subtitle="Live operational reporting from currently connected backend data sources." />
      <MetricGrid metrics={metrics} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <CardShell className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-black">Financial Trend</h2>
            <SoftTag tone={chartData.length ? "green" : "amber"}>{chartData.length ? "Live" : "No chart data"}</SoftTag>
          </div>
          {chartData.length ? (
            <ComparisonLineChart data={chartData} primaryKey="provider" secondaryKey="commission" />
          ) : (
            <div className="grid h-[260px] place-items-center rounded-xl border border-dashed text-center text-sm font-semibold text-muted-foreground">
              Financial endpoint did not return chart data.
            </div>
          )}
        </CardShell>

        <CardShell className="p-4">
          <h2 className="text-base font-black">Jobs by Status</h2>
          {jobStatus.length ? (
            <>
              <DonutChart data={jobStatus} total={String(totalJobs)} label="Total Jobs" height={190} />
              <div className="space-y-3">
                {jobStatus.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-black">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm font-semibold text-muted-foreground">No booking status data available.</p>
          )}
        </CardShell>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <CardShell className="p-4">
          <h2 className="mb-4 text-base font-black">Connected Report Sources</h2>
          <AdminDataTable data={sourceRows} columns={sourceColumns} minWidth="980px" rowLabel="data sources" />
        </CardShell>

        <CardShell className="p-4">
          <h2 className="text-base font-black">Reporting Notes</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex gap-2 rounded-xl border bg-background p-3 font-semibold">
              <BarChart3 className="mt-0.5 h-4 w-4 text-primary" />
              Figures on this page are computed from live hooks and update when their API responses refresh.
            </p>
            <p className="flex gap-2 rounded-xl border bg-background p-3 font-semibold">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              No generated reports endpoint is currently connected, so no fabricated report records are shown.
            </p>
            <p className="flex gap-2 rounded-xl border bg-background p-3 font-semibold">
              <Activity className="mt-0.5 h-4 w-4 text-primary" />
              Audit coverage depends on records returned by the `/audit/` endpoint.
            </p>
          </div>
        </CardShell>
      </section>
    </div>
  );
}
