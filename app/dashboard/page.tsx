"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Briefcase, CheckCircle2, ClipboardCheck, Clock3, DollarSign, ShieldCheck, UserCheck, Users } from "lucide-react";
import { RequestStatusDonut } from "@/components/dashboard/RequestStatusDonut";
import { RequestsOverviewChart } from "@/components/dashboard/RequestsOverviewChart";
import { RecentRequests } from "@/components/dashboard/RecentRequests";
import { RevenueOverview } from "@/components/dashboard/RevenueOverview";
import { StatCard } from "@/components/dashboard/StatCard";
import { TopServices } from "@/components/dashboard/TopServices";
import { DataFreshness } from "@/components/shared/DataFreshness";
import { PageHeader } from "@/components/shared/PageHeader";
import { companiesQueryKey, useCompanies } from "@/hooks/useCompanies";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useDashboardAnalytics, useDashboardSummary } from "@/hooks/useDashboard";
import { useDisputeStats } from "@/hooks/useDisputes";
import { useFinancialEarnings } from "@/hooks/useFinancial";
import { mechanicsQueryKey, useIndividualMechanics } from "@/hooks/useMechanics";
import { useServiceRequestStats, useServiceRequests } from "@/hooks/useServiceRequests";
import { usersQueryKey, useUsers } from "@/hooks/useUsers";
import { activeStatus, asRecord, firstText, getKycStatus, metricChange, metricValue, money, text, timeText } from "@/lib/live-data";
import { hasPermission, Permission } from "@/lib/rbac";
import { useUiStore } from "@/store/use-ui-store";

const RANGE_LABELS: Record<string, string> = { "7D": "Last 7 days", "30D": "Last 30 days", "90D": "Last 90 days" };
const AUTO_REFRESH_MS = 60_000;

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
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const canViewFinancials = hasPermission(role, Permission.EARNINGS);
  const [range, setRange] = useState("30D");

  const summaryQuery = useDashboardSummary();
  const analyticsQuery = useDashboardAnalytics(range);
  const usersQuery = useUsers();
  const serviceRequestStatsQuery = useServiceRequestStats();
  const serviceRequestsQuery = useServiceRequests();
  const companyProvidersQuery = useCompanies();
  const individualProvidersQuery = useIndividualMechanics();
  const disputeStatsQuery = useDisputeStats();
  const earningsQuery = useFinancialEarnings(canViewFinancials);

 
  useAutoRefresh(
    [["dashboard"], ["serviceRequests"], ["disputes", "stats"], companiesQueryKey, mechanicsQueryKey, usersQueryKey, ...(canViewFinancials ? [["financial", "earnings"]] : [])],
    AUTO_REFRESH_MS,
  );

  const lastUpdated = useMemo(() => {
    const timestamps = [summaryQuery.dataUpdatedAt, analyticsQuery.dataUpdatedAt, usersQuery.dataUpdatedAt, serviceRequestStatsQuery.dataUpdatedAt, companyProvidersQuery.dataUpdatedAt, individualProvidersQuery.dataUpdatedAt, disputeStatsQuery.dataUpdatedAt, earningsQuery.dataUpdatedAt].filter(Boolean);
    return timestamps.length ? Math.max(...timestamps) : 0;
  }, [summaryQuery.dataUpdatedAt, analyticsQuery.dataUpdatedAt, usersQuery.dataUpdatedAt, serviceRequestStatsQuery.dataUpdatedAt, companyProvidersQuery.dataUpdatedAt, individualProvidersQuery.dataUpdatedAt, disputeStatsQuery.dataUpdatedAt, earningsQuery.dataUpdatedAt]);

  const isRefreshing = [summaryQuery, analyticsQuery, usersQuery, serviceRequestStatsQuery, companyProvidersQuery, individualProvidersQuery, disputeStatsQuery, earningsQuery].some((query) => query.isFetching && !query.isLoading);

  const summary = asRecord(summaryQuery.data);
  const analytics = asRecord(analyticsQuery.data);
  const serviceRequestStats = asRecord(serviceRequestStatsQuery.data);
  const earnings = asRecord(earningsQuery.data);
  const disputeStats = asRecord(disputeStatsQuery.data);
  const individualProvidersCount = individualProvidersQuery.data?.length ?? 0;
  const companyProvidersCount = companyProvidersQuery.data?.length ?? 0;
  const totalServiceProviders = individualProvidersCount + companyProvidersCount;
  const providersErrored = individualProvidersQuery.isError || companyProvidersQuery.isError;
  const providersLoading = individualProvidersQuery.isLoading || companyProvidersQuery.isLoading;

  const activeUsersCount = (usersQuery.data ?? []).filter((user) => activeStatus(user as unknown as Record<string, unknown>).toLowerCase().includes("active")).length;
  const pendingVerificationsCount =
    (companyProvidersQuery.data ?? []).filter((company) => getKycStatus(company) === "Pending").length +
    (individualProvidersQuery.data ?? []).filter((mechanic) => getKycStatus(mechanic) === "Pending").length;

  const cards = [
    {
      label: "Total Customers",
      value: usersQuery.data?.length !== undefined ? String(usersQuery.data.length) : metricValue(summary, ["totalUsers", "users"]),
      change: usersQuery.data ? "Derived from loaded customers" : "Live backend data",
      icon: Users,
      tone: "red",
      href: "/dashboard/customers",
      isLoading: usersQuery.isLoading,
      isError: usersQuery.isError,
      onRetry: () => void usersQuery.refetch(),
    },
    {
      label: "Active Users",
      value: usersQuery.data ? String(activeUsersCount) : "0",
      change: "Customers with an active account",
      icon: UserCheck,
      tone: "green",
      href: "/dashboard/customers",
      isLoading: usersQuery.isLoading,
      isError: usersQuery.isError,
      onRetry: () => void usersQuery.refetch(),
    },
    {
      label: "Service Providers",
      value: individualProvidersQuery.data || companyProvidersQuery.data ? String(totalServiceProviders) : metricValue(summary, ["serviceProviders", "totalProviders", "providers"]),
      change: `${individualProvidersCount} individual • ${companyProvidersCount} company`,
      icon: ShieldCheck,
      tone: "red",
      href: "/dashboard/service-providers",
      isLoading: providersLoading,
      isError: providersErrored,
      onRetry: () => {
        void individualProvidersQuery.refetch();
        void companyProvidersQuery.refetch();
      },
    },
    {
      label: "Pending Verifications",
      value: individualProvidersQuery.data || companyProvidersQuery.data ? String(pendingVerificationsCount) : "0",
      change: "Awaiting KYC review",
      icon: ClipboardCheck,
      tone: "amber",
      direction: "down" as const,
      href: "/dashboard/service-providers",
      isLoading: providersLoading,
      isError: providersErrored,
      onRetry: () => {
        void individualProvidersQuery.refetch();
        void companyProvidersQuery.refetch();
      },
    },
    {
      label: "Total Requests",
      value: metricValue(serviceRequestStats, ["totalRequests", "totalServiceRequests", "totalBookings", "total"], metricValue(summary, ["totalJobs", "jobs", "serviceRequests", "bookings"])),
      change: metricChange(serviceRequestStats, ["totalRequests", "totalServiceRequests", "totalBookings", "total"]),
      icon: Briefcase,
      tone: "blue",
      href: "/dashboard/requests",
      isLoading: serviceRequestStatsQuery.isLoading && serviceRequestsQuery.isLoading,
      isError: serviceRequestStatsQuery.isError && serviceRequestsQuery.isError,
      onRetry: () => void serviceRequestStatsQuery.refetch(),
    },
    {
      label: "Active Requests",
      value: metricValue(serviceRequestStats, ["inProgressJobs", "inProgress", "ongoing"]),
      change: metricChange(serviceRequestStats, ["inProgressJobs", "inProgress", "ongoing"]),
      icon: Clock3,
      tone: "purple",
      href: "/dashboard/requests",
      isLoading: serviceRequestStatsQuery.isLoading,
      isError: serviceRequestStatsQuery.isError,
      onRetry: () => void serviceRequestStatsQuery.refetch(),
    },
    {
      label: "Completed Requests",
      value: metricValue(serviceRequestStats, ["completedJobs", "completed"], metricValue(summary, ["completedJobs", "completed"])),
      change: metricChange(serviceRequestStats, ["completedJobs", "completed"]),
      icon: CheckCircle2,
      tone: "green",
      href: "/dashboard/requests",
      isLoading: serviceRequestStatsQuery.isLoading,
      isError: serviceRequestStatsQuery.isError,
      onRetry: () => void serviceRequestStatsQuery.refetch(),
    },
    {
      label: "Disputes",
      value: metricValue(disputeStats, ["totalDisputes", "total"]),
      change: `${metricValue(disputeStats, ["open", "openDisputes"], "0")} open`,
      icon: AlertTriangle,
      tone: "amber",
      direction: "down" as const,
      href: "/dashboard/disputes",
      isLoading: disputeStatsQuery.isLoading,
      isError: disputeStatsQuery.isError,
      onRetry: () => void disputeStatsQuery.refetch(),
    },
    ...(canViewFinancials
      ? [
          {
            label: "Total Revenue",
            value: money(earnings.totalEarnings ?? earnings.total ?? summary.totalRevenue ?? summary.revenue),
            change: metricChange(earnings, ["totalEarnings", "total", "revenue"]),
            icon: DollarSign,
            tone: "amber",
            href: "/dashboard/earnings-payments",
            isLoading: earningsQuery.isLoading,
            isError: earningsQuery.isError,
            onRetry: () => void earningsQuery.refetch(),
          },
          {
            label: "Pending Payouts",
            value: money(earnings.pendingPayouts),
            change: "Awaiting disbursement",
            icon: Clock3,
            tone: "teal",
            direction: "down" as const,
            href: "/dashboard/earnings-payments",
            isLoading: earningsQuery.isLoading,
            isError: earningsQuery.isError,
            onRetry: () => void earningsQuery.refetch(),
          },
        ]
      : []),
  ];

  const completedJobs = numericMetric(serviceRequestStats, ["completedJobs", "completed"]);
  const inProgressJobs = numericMetric(serviceRequestStats, ["inProgress", "ongoing"]);
  const cancelledJobs = numericMetric(serviceRequestStats, ["cancelledJobs", "cancelled"]);
  const pendingJobs = numericMetric(serviceRequestStats, ["pendingRequests", "pending"]);
  const totalJobs = numericMetric(serviceRequestStats, ["totalRequests", "totalServiceRequests", "totalBookings", "total"]) || (serviceRequestsQuery.data?.data.length ?? 0);
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
  const recentServiceRequests = (serviceRequestsQuery.data?.data ?? []).slice(0, 5).map((serviceRequest, index) => {
    const record = serviceRequest as unknown as Record<string, unknown>;
    return {
      id: String(index + 1),
      name: text(record.customer, firstText(record, ["customerName"], "Customer")),
      location: firstText(record, ["customerAddress", "location", "address"]),
      status: activeStatus(record, "Pending"),
      time: timeText(serviceRequest.createdAt) || firstText(record, ["time", "createdAt"]),
    };
  });
  const recentRequests = recentServiceRequests.length ? recentServiceRequests : ((Array.isArray(summary.recentRequests) ? summary.recentRequests : []) as Record<string, unknown>[]).map((request, index) => ({
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

  const chartsLoading = analyticsQuery.isLoading && serviceRequestStatsQuery.isLoading;
  const chartsErrored = analyticsQuery.isError && serviceRequestStatsQuery.isError;
  const requestsLoading = serviceRequestsQuery.isLoading && summaryQuery.isLoading;
  const requestsErrored = serviceRequestsQuery.isError && summaryQuery.isError;
  const revenueLoading = analyticsQuery.isLoading && summaryQuery.isLoading;
  const revenueErrored = analyticsQuery.isError && summaryQuery.isError;
  const periodLabel = RANGE_LABELS[range] ?? range;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Dashboard" subtitle="Welcome back, Admin! Here's what's happening with Sherix today." />
        <div role="status">
          <DataFreshness isFetching={isRefreshing} dataUpdatedAt={lastUpdated} />
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Key performance indicators">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          {chartsLoading ? (
            <div className="h-[380px] animate-pulse rounded-xl bg-muted lg:col-span-2" />
          ) : chartsErrored ? (
            <div className="rounded-xl border bg-card p-5 text-sm font-semibold text-red-600 lg:col-span-2">Unable to load request analytics for this period.</div>
          ) : (
            <>
              <RequestsOverviewChart data={jobsOverview} range={range} onRangeChange={setRange} />
              <RequestStatusDonut data={jobStatus} total={String(totalJobs || metricValue(summary, ["totalJobs", "jobs", "serviceRequests", "bookings"]))} periodLabel={periodLabel} />
            </>
          )}
        </div>
        {requestsLoading ? <div className="h-[380px] animate-pulse rounded-xl bg-muted" /> : requestsErrored ? <div className="rounded-xl border bg-card p-5 text-sm font-semibold text-red-600">Unable to load recent requests.</div> : <RecentRequests requests={recentRequests} />}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.1fr)_minmax(260px,0.8fr)]">
        {revenueLoading ? (
          <div className="h-[300px] animate-pulse rounded-xl bg-muted xl:col-span-2" />
        ) : revenueErrored ? (
          <div className="rounded-xl border bg-card p-5 text-sm font-semibold text-red-600 xl:col-span-2">Unable to load revenue and services data.</div>
        ) : canViewFinancials ? (
          <>
            <RevenueOverview data={revenueOverview} total={money(summary.totalRevenue ?? summary.revenue)} periodLabel={periodLabel} />
            <TopServices services={topServices} />
          </>
        ) : (
          <TopServices services={topServices} />
        )}
      </section>
    </div>
  );
}
