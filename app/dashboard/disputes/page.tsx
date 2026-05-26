"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, ExternalLink, Info, X } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  FilterSelect,
  InitialAvatar,
  MetricGrid,
  PaginationFooter,
  SearchBox,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { disputeMetrics, disputes } from "@/lib/mock-data";

type DisputeRow = (typeof disputes)[number];

const disputeColumns: ColumnDef<DisputeRow>[] = [
  { accessorKey: "id", header: "Dispute ID", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  {
    accessorKey: "jobId",
    header: "Job ID",
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <Link href={`/dashboard/jobs/${row.original.jobId}`} className="font-black hover:text-primary">
          {row.original.jobId}
        </Link>
        <p className="text-xs text-muted-foreground">{row.original.jobName}</p>
      </div>
    ),
  },
  {
    accessorKey: "raisedBy",
    header: "Raised By",
    cell: ({ row }) => (
      <div className="flex min-w-[150px] items-center gap-3">
        <InitialAvatar initials={row.original.raisedInitials} />
        <div>
          <p className="font-bold">{row.original.raisedBy}</p>
          <p className="text-xs text-muted-foreground">Customer</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "against",
    header: "Against",
    cell: ({ row }) => (
      <div className="flex min-w-[160px] items-center gap-3">
        <InitialAvatar initials={row.original.againstInitials} className="bg-black text-white" />
        <div>
          <p className="font-bold">{row.original.against}</p>
          <p className="text-xs text-muted-foreground">Provider</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "reason", header: "Reason", cell: ({ row }) => <span className="inline-block min-w-[210px] font-semibold">{row.original.reason}</span> },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className="font-black">{row.original.amount}</span> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  {
    accessorKey: "raisedOn",
    header: "Raised On",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <p className="font-semibold">{row.original.raisedOn}</p>
        <p className="text-xs text-muted-foreground">{row.original.time}</p>
      </div>
    ),
  },
  { id: "actions", header: "Actions", cell: () => <ActionMenu /> },
];

export default function DisputesPage() {
  const selected = disputes[0];

  return (
    <div className="mx-auto max-w-full space-y-5">
      <PageHeader title="Disputes" subtitle="Review and manage all disputes raised on the platform." />
      <MetricGrid metrics={disputeMetrics} />

      <section className="grid gap-4">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by dispute ID, job ID, user, provider or reason..." />
            <FilterSelect placeholder="All Statuses" values={["All Statuses", "Open", "Under Review", "Resolved", "Rejected"]} />
            <FilterSelect placeholder="All Reasons" values={["All Reasons", "Billing", "Service Quality", "Late Arrival"]} />
            <FilterSelect placeholder="All Parties" values={["All Parties", "Customers", "Providers"]} />
          </ToolbarCard>
          <AdminDataTable data={disputes} columns={disputeColumns}  />
          <PaginationFooter label="Showing 1 to 8 of 128 disputes" pageCount="16" pageSize />
        </CardShell>

        
      </section>
    </div>
  );
}
