"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { AlertTriangle, CheckCircle2, Clock3, FileClock, XCircle } from "lucide-react";
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
import { useDisputeStats, useDisputes } from "@/hooks/useDisputes";
import { activeStatus, asRecord, dateText, firstText, initials, metricValue, money, recordId, text, timeText } from "@/lib/live-data";
import type { Dispute } from "@/types";

type DisputeRow = {
  id: string;
  jobId: string;
  jobName: string;
  raisedBy: string;
  raisedInitials: string;
  against: string;
  againstInitials: string;
  reason: string;
  amount: string;
  status: string;
  raisedOn: string;
  time: string;
};

function mapDispute(dispute: Dispute): DisputeRow {
  const record = dispute as unknown as Record<string, unknown>;
  const raisedBy = text(record.raisedBy, "Unknown customer");
  const against = text(record.against, "Unknown provider");
  const serviceRequest = asRecord(record.serviceRequest ?? record.booking);
  return {
    id: recordId(dispute),
    jobId: firstText(record, ["jobId"], firstText(serviceRequest, ["id", "_id", "requestId"], "-")),
    jobName: text(serviceRequest.service, "-"),
    raisedBy,
    raisedInitials: initials(raisedBy),
    against,
    againstInitials: initials(against),
    reason: firstText(record, ["reason", "description"]),
    amount: money(record.amount),
    status: activeStatus(record, "Open"),
    raisedOn: dateText(dispute.createdAt),
    time: timeText(dispute.createdAt),
  };
}

const disputeColumns: ColumnDef<DisputeRow>[] = [
  { accessorKey: "id", header: "Dispute ID", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  {
    accessorKey: "jobId",
    header: "Request ID",
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <Link href={`/dashboard/requests/${row.original.jobId}`} className="font-black hover:text-primary">
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
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All Statuses");
  const disputesQuery = useDisputes();
  const statsQuery = useDisputeStats();
  const rows = React.useMemo(() => (disputesQuery.data ?? []).map(mapDispute), [disputesQuery.data]);
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !search || [row.jobName, row.raisedBy, row.against, row.reason, row.status].join(" ").toLowerCase().includes(search);
      const matchesStatus = status === "All Statuses" || row.status.toLowerCase().includes(status.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [query, rows, status]);
  const stats = asRecord(statsQuery.data);
  const metrics = [
    { label: "Total Disputes", value: metricValue(stats, ["totalDisputes", "total"], String(rows.length)), change: "Live backend data", direction: "down", tone: "purple", icon: AlertTriangle },
    { label: "Open", value: metricValue(stats, ["open", "openDisputes"]), change: "Live backend data", direction: "down", tone: "amber", icon: Clock3 },
    { label: "Under Review", value: metricValue(stats, ["underReview", "inReview"]), change: "Live backend data", direction: "up", tone: "blue", icon: FileClock },
    { label: "Resolved", value: metricValue(stats, ["resolved", "resolvedDisputes"]), change: "Live backend data", direction: "up", tone: "green", icon: CheckCircle2 },
    { label: "Rejected", value: metricValue(stats, ["rejected", "rejectedDisputes"]), change: "Live backend data", direction: "down", tone: "red", icon: XCircle },
  ];

  return (
    <div className="mx-auto max-w-full space-y-5">
      <PageHeader title="Disputes" subtitle="Review and manage all disputes raised on the platform." />
      <MetricGrid metrics={metrics} />

      <section className="grid gap-4">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by request, customer, provider or reason..." value={query} onChange={setQuery} />
            <FilterSelect placeholder="All Statuses" values={["All Statuses", "Open", "Under Review", "Resolved", "Rejected"]} value={status} onChange={setStatus} />
          </ToolbarCard>
          {disputesQuery.isLoading ? (
            <div className="p-6 text-sm font-semibold text-muted-foreground">Loading disputes...</div>
          ) : disputesQuery.isError ? (
            <div className="p-6 text-sm font-semibold text-red-600">Unable to load disputes.</div>
          ) : (
            <AdminDataTable data={filteredRows} columns={disputeColumns} rowLabel="disputes" />
          )}
        </CardShell>

        
      </section>
    </div>
  );
}
