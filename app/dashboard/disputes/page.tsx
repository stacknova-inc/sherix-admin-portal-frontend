"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, ExternalLink, Info, X } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  FilterButton,
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
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Disputes" subtitle="Review and manage all disputes raised on the platform." />
      <MetricGrid metrics={disputeMetrics} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by dispute ID, job ID, user, provider or reason..." />
            <FilterSelect placeholder="All Statuses" values={["All Statuses", "Open", "Under Review", "Resolved", "Rejected"]} />
            <FilterSelect placeholder="All Reasons" values={["All Reasons", "Billing", "Service Quality", "Late Arrival"]} />
            <FilterSelect placeholder="All Parties" values={["All Parties", "Customers", "Providers"]} />
            <FilterButton />
          </ToolbarCard>
          <AdminDataTable data={disputes} columns={disputeColumns} minWidth="1180px" />
          <PaginationFooter label="Showing 1 to 8 of 128 disputes" pageCount="16" pageSize />
        </CardShell>

        <aside className="space-y-5">
          <CardShell className="p-4">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-base font-black">Dispute Details</h2>
              <Button variant="ghost" size="icon" aria-label="Close details">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-4 flex items-start gap-4">
              <StatusBadge status={selected.status} />
              <div className="text-sm">
                <p>
                  Dispute ID: <span className="font-black">{selected.id}</span>
                </p>
                <p className="text-muted-foreground">Raised on {selected.raisedOn} at {selected.time}</p>
              </div>
            </div>
            <div className="flex gap-4 border-b">
              {["Overview", "Messages (3)", "History"].map((tab, index) => (
                <button key={tab} className={index === 0 ? "border-b-2 border-primary pb-3 text-sm font-black text-primary" : "pb-3 text-sm font-black text-muted-foreground"}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-4 text-sm">
              {[
                ["Job ID", `${selected.jobId} (${selected.jobName})`],
                ["Raised By", `${selected.raisedBy} (Customer)`],
                ["Against", `${selected.against} (Provider)`],
                ["Reason", selected.reason],
                ["Amount in Dispute", selected.amount],
                ["Status", selected.status],
                ["Description", "Provider arrived but the car was not started. I was charged without the service being completed."],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold">{label === "Status" ? <StatusBadge status={value} /> : value}</span>
                </div>
              ))}
            </div>
          </CardShell>

          <CardShell className="p-4">
            <h2 className="text-base font-black">Job Information</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Service Date</span>
                <span className="font-bold">May 18, 2025 at 10:30 AM</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-bold">{selected.amount}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-bold">Mobile Money</span>
              </div>
            </div>
            <Button asChild variant="outline" className="mt-4 w-full bg-card">
              <Link href={`/dashboard/jobs/${selected.jobId}`}>
                View Job Details
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardShell>

          <CardShell className="p-4">
            <h2 className="text-base font-black">Actions</h2>
            <div className="mt-4 grid gap-3">
              <Button variant="outline" className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10">
                <Check className="h-4 w-4" />
                Resolve Dispute
              </Button>
              <Button variant="outline" className="bg-card">
                <Info className="h-4 w-4" />
                Request More Info
              </Button>
              <Button variant="outline" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10">
                <X className="h-4 w-4" />
                Reject Dispute
              </Button>
            </div>
          </CardShell>
        </aside>
      </section>
    </div>
  );
}
