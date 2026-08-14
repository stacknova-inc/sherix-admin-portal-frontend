"use client";

import { Briefcase, ClipboardCheck, DollarSign, ShieldCheck, Users } from "lucide-react";
import { JobStatusDonut } from "@/components/dashboard/JobStatusDonut";
import { JobsOverviewChart } from "@/components/dashboard/JobsOverviewChart";
import { RecentRequests } from "@/components/dashboard/RecentRequests";
import { RevenueOverview } from "@/components/dashboard/RevenueOverview";
import { StatCard } from "@/components/dashboard/StatCard";
import { TopServices } from "@/components/dashboard/TopServices";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuditStats } from "@/hooks/useAudit";
import { useBookingStats, useBookings } from "@/hooks/useBookings";
import { useCompanies } from "@/hooks/useCompanies";
import { useDashboardAnalytics, useDashboardSummary } from "@/hooks/useDashboard";
import { useFinancialEarnings } from "@/hooks/useFinancial";
import { useIndividualMechanics } from "@/hooks/useMechanics";
import { useUsers } from "@/hooks/useUsers";
import { activeStatus, asRecord, firstText, metricChange, metricValue, money, text, timeText } from "@/lib/live-data";

function numericMetric(stats: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const raw = stats[key];
    const value = asRecord(raw).value ?? raw;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

export default function DashboardPage() {
  const summaryQuery = useDashboardSummary();
  const analyticsQuery = useDashboardAnalytics("30D");
  const usersQuery = useUsers();
  const bookingStatsQuery = useBookingStats();
  const bookingsQuery = useBookings();
  const companyProvidersQuery = useCompanies();
  const earningsQuery = useFinancialEarnings();
  const auditStatsQuery = useAuditStats();
  const individualProvidersQuery = useIndividualMechanics();
  const summary = asRecord(summaryQuery.data);
  const analytics = asRecord(analyticsQuery.data);
  const bookingStats = asRecord(bookingStatsQuery.data);
  const earnings = asRecord(earningsQuery.data);
  const individualProvidersCount = individualProvidersQuery.data?.length ?? 0;
  const companyProvidersCount = companyProvidersQuery.data?.length ?? 0;
  const totalServiceProviders = individualProvidersCount + companyProvidersCount;
  const cards = [
    { label: "Total Customers", value: usersQuery.data?.length !== undefined ? String(usersQuery.data.length) : metricValue(summary, ["totalUsers", "users"]), change: usersQuery.data ? "Derived from loaded customers" : "Live backend data", icon: Users, tone: "red" },
    {
      label: "Service Providers",
      value: individualProvidersQuery.data || companyProvidersQuery.data
        ? String(totalServiceProviders)
        : metricValue(summary, ["serviceProviders", "totalProviders", "providers"]),
      change: `${individualProvidersCount} individual • ${companyProvidersCount} company`,
      icon: ShieldCheck,
      tone: "red",
    },
    { label: "Total Jobs", value: metricValue(bookingStats, ["totalRequests", "totalBookings", "total"], metricValue(summary, ["totalJobs", "jobs", "bookings"])), change: metricChange(bookingStats, ["totalRequests", "totalBookings", "total"]), icon: Briefcase, tone: "blue" },
    { label: "Total Revenue", value: money(earnings.totalEarnings ?? earnings.total ?? summary.totalRevenue ?? summary.revenue), change: metricChange(earnings, ["totalEarnings", "total", "revenue"]), icon: DollarSign, tone: "amber" },
    { label: "Completed Jobs", value: metricValue(bookingStats, ["completedJobs", "completed"], metricValue(summary, ["completedJobs", "completed"])), change: metricChange(bookingStats, ["completedJobs", "completed"]), icon: ClipboardCheck, tone: "green" },
  ];
  const completedJobs = numericMetric(bookingStats, ["completedJobs", "completed"]);
  const inProgressJobs = numericMetric(bookingStats, ["inProgress", "ongoing"]);
  const cancelledJobs = numericMetric(bookingStats, ["cancelledJobs", "cancelled"]);
  const pendingJobs = numericMetric(bookingStats, ["pendingRequests", "pending"]);
  const totalJobs = numericMetric(bookingStats, ["totalRequests", "totalBookings", "total"]) || (bookingsQuery.data?.length ?? 0);
  const jobsOverview = ((Array.isArray(analytics.jobsOverview) ? analytics.jobsOverview : Array.isArray(analytics.jobs) ? analytics.jobs : []) as Array<Record<string, string | number>>).length
    ? ((Array.isArray(analytics.jobsOverview) ? analytics.jobsOverview : analytics.jobs) as Array<Record<string, string | number>>)
    : [{ day: "Current", completed: completedJobs, inProgress: inProgressJobs, cancelled: cancelledJobs}];
  const revenueOverview = (Array.isArray(analytics.revenueOverview) ? analytics.revenueOverview : Array.isArray(analytics.revenue) ? analytics.revenue : []) as Array<Record<string, string | number>>;
  const statusData = (Array.isArray(analytics.jobStatus) ? analytics.jobStatus : Array.isArray(summary.jobStatus) ? summary.jobStatus : []) as Array<{ name: string; value: number; percent?: string; color?: string }>;
  const liveStatusData: Array<{ name: string; value: number; percent?: string; color?: string }> = statusData.length
    ? statusData
    : [
        { name: "Completed", value: completedJobs, color: "#16A34A" },
        { name: "In Progress", value: inProgressJobs, color: "#2563EB" },
        { name: "Pending", value: pendingJobs, color: "#F59E0B" },
        { name: "Cancelled", value: cancelledJobs, color: "#DC2626" },
      ].filter((item) => item.value > 0);
  const jobStatus = liveStatusData.map((item, index) => {
    const value = Number(item.value ?? 0);
    return {
      name: item.name,
      value,
      percent: item.percent ?? (totalJobs ? `${((value / totalJobs) * 100).toFixed(1)}%` : "0%"),
      color: item.color ?? ["#16A34A", "#2563EB", "#F59E0B", "#F97316", "#DC2626"][index % 5],
    };
  });
  const recentBookings = (bookingsQuery.data ?? []).slice(0, 5).map((booking, index) => {
    const record = booking as unknown as Record<string, unknown>;
    return {
      id: String(index + 1),
      name: text(record.customer, firstText(record, ["customerName"], "Customer")),
      location: firstText(record, ["location", "address"]),
      status: activeStatus(record, "Pending"),
      time: timeText(booking.createdAt) || firstText(record, ["time", "createdAt"]),
    };
  });
  const recentRequests = recentBookings.length ? recentBookings : ((Array.isArray(summary.recentRequests) ? summary.recentRequests : []) as Record<string, unknown>[]).map((request, index) => ({
    id: String(index + 1),
    name: text(request.customer, firstText(request, ["customerName"], "Customer")),
    location: firstText(request, ["location", "address"]),
    status: firstText(request, ["status"], "Pending"),
    time: firstText(request, ["time", "createdAt"]),
  }));
  const topServices = ((Array.isArray(analytics.topServices) ? analytics.topServices : Array.isArray(summary.topServices) ? summary.topServices : []) as Record<string, unknown>[]).map((service) => ({
    name: firstText(service, ["name", "service"], "Service"),
    count: firstText(service, ["count", "total"], "0"),
    percent: Number(service.percent ?? service.percentage ?? 0),
  }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Dashboard" subtitle="Welcome back, Admin! Here's what's happening with Sherix today." />
      {summaryQuery.isLoading && usersQuery.isLoading && bookingStatsQuery.isLoading && companyProvidersQuery.isLoading ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-xl bg-muted" />)}
        </section>
      ) : summaryQuery.isError && usersQuery.isError && bookingStatsQuery.isError && companyProvidersQuery.isError && earningsQuery.isError && auditStatsQuery.isError ? (
        <div className="rounded-xl border bg-card p-5 text-sm font-semibold text-red-600">Unable to load dashboard stats.</div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>
      )}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <JobsOverviewChart data={jobsOverview} />
          <JobStatusDonut data={jobStatus} total={String(totalJobs || metricValue(summary, ["totalJobs", "jobs", "bookings"]))} />
        </div>
        <RecentRequests requests={recentRequests} />
      </section>
      
      <section className="grid gap-4 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.1fr)_minmax(260px,0.8fr)]">
        <RevenueOverview data={revenueOverview} total={money(summary.totalRevenue ?? summary.revenue)} />
        <TopServices services={topServices} />
      </section>
      
    </div>
  );
}
