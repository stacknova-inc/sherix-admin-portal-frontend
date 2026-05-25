"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { DonutChart } from "@/components/shared/AdminCharts";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ExportButton,
  FilterButton,
  FilterSelect,
  InitialAvatar,
  MetricGrid,
  PaginationFooter,
  ProgressRow,
  SearchBox,
  SectionHeader,
  SoftTag,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { auditActionBreakdown, auditLogs, auditMetrics, auditSeverityBreakdown } from "@/lib/mock-data";

type AuditRow = (typeof auditLogs)[number];

const roleTone: Record<string, string> = {
  Admin: "purple",
  Support: "blue",
  Moderator: "amber",
  System: "slate",
};

const resourceTone: Record<string, string> = {
  "Service Provider": "purple",
  Payout: "green",
  Job: "blue",
  User: "blue",
  Service: "blue",
  Dispute: "red",
  Notification: "amber",
  System: "purple",
};

const auditColumns: ColumnDef<AuditRow>[] = [
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      const [date, time] = row.original.time.split("\n");
      return (
        <div className="min-w-[120px]">
          <p className="font-semibold">{date}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <div className="flex min-w-[170px] items-center gap-3">
        <InitialAvatar initials={row.original.initials} />
        <div>
          <p className="font-black">{row.original.user}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "role", header: "Role", cell: ({ row }) => <SoftTag tone={roleTone[row.original.role]}>{row.original.role}</SoftTag> },
  { accessorKey: "action", header: "Action", cell: ({ row }) => <span className="inline-block min-w-[170px] font-bold">{row.original.action}</span> },
  { accessorKey: "resource", header: "Resource", cell: ({ row }) => <SoftTag tone={resourceTone[row.original.resource]}>{row.original.resource}</SoftTag> },
  { accessorKey: "resourceId", header: "Resource ID", cell: ({ row }) => <span className="font-semibold">{row.original.resourceId}</span> },
  { accessorKey: "ip", header: "IP Address" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { id: "details", header: "Details", cell: () => <ActionMenu /> },
];

export default function AuditLogsPage() {
  const selected = auditLogs[0];
  const [selectedDate, selectedTime] = selected.time.split("\n");

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Audit Logs" subtitle="Track and review all important activities performed across the platform." />
      <MetricGrid metrics={auditMetrics} columns="xl:grid-cols-4" />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by keyword (e.g. user, action, resource, IP)" />
            <FilterSelect placeholder="All Actions" values={["All Actions", "Updated", "Approved", "Deleted", "Login"]} />
            <FilterSelect placeholder="All Users" values={["All Users", "Admin", "Support", "System"]} />
            <FilterSelect placeholder="All Roles" values={["All Roles", "Admin", "Support", "Moderator"]} />
            <FilterSelect placeholder="All Resources" values={["All Resources", "User", "Job", "Payout", "System"]} />
            <FilterButton />
            <ExportButton />
          </ToolbarCard>
          <AdminDataTable data={auditLogs} columns={auditColumns} minWidth="1240px" />
          <PaginationFooter label="Showing 1 to 10 of 5,842 events" pageCount="585" pageSize />
        </CardShell>

        <aside className="space-y-5">
          <CardShell className="p-4">
            <SectionHeader title="Events by Action" />
            <div className="grid gap-3 sm:grid-cols-[170px_1fr] xl:grid-cols-1">
              <DonutChart data={auditActionBreakdown} total="5,842" label="Total" height={180} />
              <div className="space-y-3">
                {auditActionBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold">
                      {item.value.toLocaleString()} ({item.percent})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardShell>

          <CardShell className="p-4">
            <SectionHeader title="Events by Severity" />
            <div className="space-y-4">
              {auditSeverityBreakdown.map((event) => (
                <ProgressRow
                  key={event.label}
                  label={event.label}
                  value={event.value.toLocaleString()}
                  percent={event.percent}
                  width={event.width}
                  color={event.color}
                />
              ))}
            </div>
          </CardShell>

          <CardShell className="p-4">
            <h2 className="text-base font-black">Log Details</h2>
            <div className="mt-4 space-y-4 text-sm">
              {[
                ["Time", `${selectedDate} ${selectedTime}`],
                ["User", `${selected.user} (${selected.email})`],
                ["Role", selected.role],
                ["Action", selected.action],
                ["Resource", `${selected.resource} (${selected.resourceId})`],
                ["IP Address", selected.ip],
                ["User Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"],
                ["Status", selected.status],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[94px_1fr] gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold">{label === "Status" ? <StatusCell status={value} /> : value}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full bg-card">
              View Full Details
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardShell>
        </aside>
      </section>
    </div>
  );
}
