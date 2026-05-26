"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ExportButton,
  FilterSelect,
  InitialAvatar,
  MetricGrid,
  PaginationFooter,
  ProgressRow,
  RatingStars,
  SearchBox,
  SectionHeader,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ratingDistribution, ratingsMetrics, reviews, topRatedProviders } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ReviewRow = (typeof reviews)[number];

const reviewColumns: ColumnDef<ReviewRow>[] = [
  { accessorKey: "id", header: "Review ID", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <RatingStars rating={row.original.rating} showValue={false} />
        <span className="text-xs font-bold">{row.original.rating.toFixed(1)}</span>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Review",
    cell: ({ row }) => (
      <div className="max-w-[280px]">
        <p className="font-black">{row.original.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.original.text}</p>
      </div>
    ),
  },
  {
    accessorKey: "job",
    header: "Related To",
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <p className="font-bold">{row.original.job}</p>
        <p className="text-xs text-muted-foreground">{row.original.service}</p>
      </div>
    ),
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => (
      <div className="flex min-w-[150px] items-center gap-3">
        <InitialAvatar initials={row.original.initials} />
        <div>
          <p className="font-bold">{row.original.reviewer}</p>
          <p className="text-xs text-muted-foreground">Customer</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <p className="font-bold">{row.original.provider}</p>
        <p className="text-xs text-muted-foreground">{row.original.providerId}</p>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <p className="font-semibold">{row.original.date}</p>
        <p className="text-xs text-muted-foreground">{row.original.time}</p>
      </div>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { id: "actions", header: "Actions", cell: () => <ActionMenu /> },
];

export default function RatingsReviewsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Ratings & Reviews" subtitle="Monitor and manage ratings and reviews across the platform." />
      <MetricGrid metrics={ratingsMetrics} columns="xl:grid-cols-6" />

      <div className=" font-bold">
       All Reviews
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by review ID, provider, customer or service..." />
            <FilterSelect placeholder="All Ratings" values={["All Ratings", "5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"]} />
            <FilterSelect placeholder="All Services" values={["All Services", "Battery", "Tire Change", "Diagnostics"]} />
            <FilterSelect placeholder="All Statuses" values={["All Statuses", "Published", "Pending", "Flagged"]} />
            <FilterSelect placeholder="All Sources" values={["All Sources", "Mobile App", "Web"]} />
            <ExportButton />
          </ToolbarCard>
          <AdminDataTable data={reviews} columns={reviewColumns} minWidth="1280px" />
          <PaginationFooter label="Showing 1 to 8 of 2,845 reviews" pageCount="285" />
        </CardShell>

        <aside className="space-y-5">
          <CardShell className="p-4">
            <SectionHeader title="Rating Distribution" action="View Details" />
            <div className="space-y-4">
              {ratingDistribution.map((rating) => (
                <ProgressRow
                  key={rating.label}
                  label={rating.label}
                  value={rating.value.toLocaleString()}
                  percent={rating.percent}
                  width={rating.width}
                  color={rating.color}
                />
              ))}
            </div>
          </CardShell>

          <CardShell className="p-4">
            <SectionHeader title="Top Rated Providers" />
            <div className="space-y-4">
              {topRatedProviders.map((provider) => (
                <div key={provider.rank} className="grid grid-cols-[22px_36px_1fr_72px] items-center gap-3 text-sm">
                  <span className="font-black">{provider.rank}</span>
                  <InitialAvatar initials={provider.initials} className="bg-black text-white" />
                  <span className="font-bold">{provider.name}</span>
                  <span className="font-black">
                    {provider.rating} <span className="text-amber-400">★</span>
                  </span>
                </div>
              ))}
            </div>
          </CardShell>

          <CardShell className="p-4">
            <h2 className="text-base font-black">Review Insights</h2>
            <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-950 dark:bg-blue-500/10 dark:text-blue-100">
              Most negative feedback is about delays and communication.
            </div>
            <Button variant="outline" className="mt-4 w-full bg-card">
              View Insights
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardShell>
        </aside>
      </section>
    </div>
  );
}
