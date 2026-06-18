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

      
    </div>
  );
}
