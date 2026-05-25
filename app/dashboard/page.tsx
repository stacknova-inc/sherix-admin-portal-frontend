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
import { statCards } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Dashboard" subtitle="Welcome back, Admin! Here's what's happening with Sherix today." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <JobsOverviewChart />
          <JobStatusDonut />
        </div>
        <RecentRequests />
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.1fr)_minmax(260px,0.8fr)]">
        <ServiceProviderVerification />
        <RevenueOverview />
        <TopServices />
      </section>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <RecentActivity />
        <SystemStatus />
      </section>
    </div>
  );
}
