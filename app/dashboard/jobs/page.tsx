"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ExportButton,
  FilterSelect,
  MetricGrid,
  PaginationFooter,
  SearchBox,
  SoftTag,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { jobsMetrics, jobsRequests } from "@/lib/mock-data";

type JobRow = (typeof jobsRequests)[number];

const priorityTone: Record<string, string> = {
  High: "red",
  Medium: "amber",
  Low: "blue",
};

const jobColumns: ColumnDef<JobRow>[] = [
  {
    accessorKey: "id",
    header: "Job ID",
    cell: ({ row }) => (
      <div className="min-w-[130px]">
        <Link href={`/dashboard/jobs/${row.original.id}`} className="font-black text-primary hover:underline">
          {row.original.id}
        </Link>
        <p className="text-xs text-muted-foreground">{row.original.requestId}</p>
      </div>
    ),
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => (
      <div className="min-w-[170px]">
        <p className="font-bold">{row.original.service}</p>
        <p className="text-xs text-muted-foreground">{row.original.location}</p>
      </div>
    ),
  },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "provider", header: "Provider" },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className="font-bold">{row.original.amount}</span> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { accessorKey: "priority", header: "Priority", cell: ({ row }) => <SoftTag tone={priorityTone[row.original.priority]}>{row.original.priority}</SoftTag> },
  { accessorKey: "paymentStatus", header: "Payment", cell: ({ row }) => <StatusCell status={row.original.paymentStatus} /> },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <p className="font-semibold">{row.original.date}</p>
        <p className="text-xs text-muted-foreground">{row.original.time}</p>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="icon" aria-label="View job details">
          <Link href={`/dashboard/jobs/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <ActionMenu detailHref={`/dashboard/jobs/${row.original.id}`} />
      </div>
    ),
  },
];

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Jobs / Requests" subtitle="Track, assign and manage service requests across the platform." />
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Create Job
        </Button>
      </div>

      <MetricGrid metrics={jobsMetrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search by job ID, request ID, customer, provider or service..." />
          <FilterSelect placeholder="All Statuses" values={["All Statuses", "Pending", "Ongoing", "Completed", "Cancelled"]} />
          <FilterSelect placeholder="All Services" values={["All Services", "Battery", "Tire Change", "Diagnostics", "Towing"]} />
          <FilterSelect placeholder="Priority" values={["Priority", "High", "Medium", "Low"]} />
          <div className="flex gap-3">
            <ExportButton />
          </div>
        </ToolbarCard>
        <AdminDataTable data={jobsRequests} columns={jobColumns} minWidth="1280px" />
        <PaginationFooter label="Showing 1 to 8 of 3,892 jobs" pageCount="390" pageSize />
      </CardShell>
    </div>
  );
}
