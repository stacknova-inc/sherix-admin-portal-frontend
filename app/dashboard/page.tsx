"use client";

import { Briefcase, ClipboardCheck, DollarSign, ShieldCheck, Users } from "lucide-react";
import { JobStatusDonut } from "@/components/dashboard/JobStatusDonut";
import { JobsOverviewChart } from "@/components/dashboard/JobsOverviewChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentRequests } from "@/components/dashboard/RecentRequests";
import { RevenueOverview } from "@/components/dashboard/RevenueOverview";
import { ServiceProviderVerification } from "@/components/dashboard/ServiceProviderVerification";
import { StatCard } from "@/components/dashboard/StatCard";
import { SystemStatus } from "@/components/dashboard/SystemStatus";
import { TopServices } from "@/components/dashboard/TopServices";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDashboardAnalytics, useDashboardSummary } from "@/hooks/useDashboard";
import { asRecord, firstText, metricValue, money, text } from "@/lib/live-data";

export default function DashboardPage() {
  const summaryQuery = useDashboardSummary();
  const analyticsQuery = useDashboardAnalytics("30D");
  const summary = asRecord(summaryQuery.data);
  const analytics = asRecord(analyticsQuery.data);
  const cards = [
    { label: "Total Users", value: metricValue(summary, ["totalUsers", "users"]), change: "Live backend data", icon: Users, tone: "red" },
    { label: "Service Providers", value: metricValue(summary, ["serviceProviders", "totalProviders", "providers"]), change: "Live backend data", icon: ShieldCheck, tone: "red" },
    { label: "Total Jobs", value: metricValue(summary, ["totalJobs", "jobs", "bookings"]), change: "Live backend data", icon: Briefcase, tone: "blue" },
    { label: "Total Revenue", value: money(summary.totalRevenue ?? summary.revenue), change: "Live backend data", icon: DollarSign, tone: "amber" },
    { label: "Completed Jobs", value: metricValue(summary, ["completedJobs", "completed"]), change: "Live backend data", icon: ClipboardCheck, tone: "green" },
  ];
  const jobsOverview = (Array.isArray(analytics.jobsOverview) ? analytics.jobsOverview : Array.isArray(analytics.jobs) ? analytics.jobs : []) as Array<Record<string, string | number>>;
  const revenueOverview = (Array.isArray(analytics.revenueOverview) ? analytics.revenueOverview : Array.isArray(analytics.revenue) ? analytics.revenue : []) as Array<Record<string, string | number>>;
  const statusData = (Array.isArray(analytics.jobStatus) ? analytics.jobStatus : Array.isArray(summary.jobStatus) ? summary.jobStatus : []) as Array<{ name: string; value: number; percent?: string; color?: string }>;
  const jobStatus = statusData.map((item, index) => ({
    name: item.name,
    value: Number(item.value ?? 0),
    percent: item.percent ?? "",
    color: item.color ?? ["#16A34A", "#2563EB", "#F59E0B", "#DC2626"][index % 4],
  }));
  const recentRequests = ((Array.isArray(summary.recentRequests) ? summary.recentRequests : []) as Record<string, unknown>[]).map((request) => ({
    id: firstText(request, ["id", "_id", "requestId"]),
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
      {summaryQuery.isLoading ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-xl bg-muted" />)}
        </section>
      ) : summaryQuery.isError ? (
        <div className="rounded-xl border bg-card p-5 text-sm font-semibold text-red-600">Unable to load dashboard summary.</div>
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
          <JobStatusDonut data={jobStatus} total={metricValue(summary, ["totalJobs", "jobs", "bookings"])} />
        </div>
        <RecentRequests requests={recentRequests} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.1fr)_minmax(260px,0.8fr)]">
        <ServiceProviderVerification />
        <RevenueOverview data={revenueOverview} total={money(summary.totalRevenue ?? summary.revenue)} />
        <TopServices services={topServices} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <RecentActivity />
        <SystemStatus />
      </section>
    </div>
  );
}
