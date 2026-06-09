"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity, AlertTriangle, CheckCircle2, Clock3, FileText, ShieldAlert, UserRoundCog } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ExportButton,
  FilterSelect,
  InitialAvatar,
  MetricGrid,
  SearchBox,
  SoftTag,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { useAuditLogs, useAuditStats } from "@/hooks/useAudit";
import { asRecord, dateText, firstText, initials, metricChange, metricDirection, metricValue, text, timeText } from "@/lib/live-data";
import type { AuditLog } from "@/services/audit";

type AuditRow = {
  id: string;
  actorName: string;
  actorEmail: string;
  role: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  status: string;
  timestamp: string;
  date: string;
  time: string;
  initials: string;
};

const actionTone: Record<string, string> = {
  login: "green",
  create: "blue",
  update: "amber",
  edit: "amber",
  approve: "green",
  reject: "red",
  delete: "red",
  suspend: "red",
  activate: "green",
};

function toneForAction(action: string) {
  const normalized = action.toLowerCase();
  return Object.entries(actionTone).find(([key]) => normalized.includes(key))?.[1] ?? "slate";
}

function normalizeStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("fail") || normalized.includes("error")) return "Failed";
  if (normalized.includes("warn")) return "Warning";
  if (normalized.includes("success") || normalized.includes("complete")) return "Success";
  return status || "Unknown";
}

function mapAuditLog(log: AuditLog): AuditRow {
  const record = log as Record<string, unknown>;
  const actor = asRecord(record.user ?? record.admin ?? record.actor ?? record.performedBy ?? record.createdBy);
  const actorName = text(
    record.user ?? record.admin ?? record.actor ?? record.performedBy ?? record.createdBy,
    firstText(record, ["userName", "adminName", "actorName", "performedByName", "name"], "System"),
  );
  const timestamp = String(record.timestamp ?? record.createdAt ?? record.time ?? record.date ?? "");
  const action = firstText(record, ["action", "actionType", "event", "activity"], "Activity");
  const module = firstText(record, ["module", "resource", "resourceType", "entity", "collection"], "System");
  const description = firstText(record, ["description", "message", "note", "details", "activityDescription"], `${action} in ${module}`);

  return {
    id: String(record.id ?? record._id ?? ""),
    actorName,
    actorEmail: firstText(actor, ["email"], firstText(record, ["email", "actorEmail", "adminEmail"], "-")),
    role: firstText(actor, ["role"], firstText(record, ["role", "actorRole", "adminRole"], "Admin")),
    action,
    module,
    description,
    ipAddress: firstText(record, ["ipAddress", "ip", "clientIp"], "-"),
    status: normalizeStatus(firstText(record, ["status", "result"], "Success")),
    timestamp,
    date: dateText(timestamp),
    time: timeText(timestamp),
    initials: initials(actorName),
  };
}

const auditColumns: ColumnDef<AuditRow>[] = [
  { accessorKey: "id", header: "#", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <SoftTag tone={toneForAction(row.original.action)}>{row.original.action}</SoftTag>,
  },
  {
    accessorKey: "actorName",
    header: "User / Admin",
    cell: ({ row }) => (
      <div className="flex min-w-[210px] items-center gap-3">
        <InitialAvatar initials={row.original.initials} />
        <div className="min-w-0">
          <p className="truncate font-black">{row.original.actorName}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.actorEmail}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "role", header: "Role", cell: ({ row }) => <span className="font-bold">{row.original.role}</span> },
  { accessorKey: "module", header: "Module", cell: ({ row }) => <SoftTag tone="blue">{row.original.module}</SoftTag> },
  {
    accessorKey: "description",
    header: "Activity Description",
    cell: ({ row }) => <span className="inline-block min-w-[260px] max-w-[420px] whitespace-normal text-sm font-semibold leading-5">{row.original.description}</span>,
  },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="min-w-[130px]">
        <p className="font-semibold">{row.original.date}</p>
        <p className="text-xs text-muted-foreground">{row.original.time || "-"}</p>
      </div>
    ),
  },
  { accessorKey: "ipAddress", header: "IP Address" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
];

export default function AuditLogsPage() {
  const logsQuery = useAuditLogs();
  const statsQuery = useAuditStats();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All Statuses");
  const [module, setModule] = React.useState("All Modules");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const rows = React.useMemo(() => (logsQuery.data ?? []).map(mapAuditLog), [logsQuery.data]);
  const modules = React.useMemo(() => ["All Modules", ...Array.from(new Set(rows.map((row) => row.module).filter(Boolean))).sort()], [rows]);
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

    return rows.filter((row) => {
      const haystack = [row.actorName, row.actorEmail, row.role, row.action, row.module, row.description, row.ipAddress, row.status].join(" ").toLowerCase();
      const created = row.timestamp ? new Date(row.timestamp) : null;
      const matchesSearch = !search || haystack.includes(search);
      const matchesStatus = status === "All Statuses" || row.status === status;
      const matchesModule = module === "All Modules" || row.module === module;
      const matchesFrom = !from || (created && created >= from);
      const matchesTo = !to || (created && created <= to);
      return matchesSearch && matchesStatus && matchesModule && matchesFrom && matchesTo;
    });
  }, [fromDate, module, query, rows, status, toDate]);
  const stats = asRecord(statsQuery.data);
  const derivedMetrics = React.useMemo(
    () => ({
      total: rows.length,
      failed: rows.filter((row) => row.status === "Failed").length,
      warning: rows.filter((row) => row.status === "Warning").length,
      success: rows.filter((row) => row.status === "Success").length,
      uniqueActors: new Set(rows.map((row) => row.actorEmail || row.actorName)).size,
    }),
    [rows],
  );
  const metrics = [
    { label: "Total Events", value: metricValue(stats, ["totalEvents", "total", "events"], String(derivedMetrics.total)), change: metricChange(stats, ["totalEvents", "total", "events"], "Current audit stream"), direction: metricDirection(stats, ["totalEvents", "total", "events"]), tone: "purple", icon: FileText },
    { label: "Unique Admins", value: metricValue(stats, ["uniqueUsers", "uniqueAdmins", "users"], String(derivedMetrics.uniqueActors)), change: metricChange(stats, ["uniqueUsers", "uniqueAdmins", "users"], "Distinct actors"), direction: metricDirection(stats, ["uniqueUsers", "uniqueAdmins", "users"]), tone: "blue", icon: UserRoundCog },
    { label: "Successful", value: metricValue(stats, ["successfulEvents", "success"], String(derivedMetrics.success)), change: metricChange(stats, ["successfulEvents", "success"], "Completed actions"), direction: metricDirection(stats, ["successfulEvents", "success"]), tone: "green", icon: CheckCircle2 },
    { label: "Warnings", value: metricValue(stats, ["warningEvents", "warnings"], String(derivedMetrics.warning)), change: metricChange(stats, ["warningEvents", "warnings"], "Review recommended"), direction: metricDirection(stats, ["warningEvents", "warnings"], "down"), tone: "amber", icon: AlertTriangle },
    { label: "Failed", value: metricValue(stats, ["failedAttempts", "failed", "failures"], String(derivedMetrics.failed)), change: metricChange(stats, ["failedAttempts", "failed", "failures"], "Needs attention"), direction: metricDirection(stats, ["failedAttempts", "failed", "failures"], "down"), tone: "red", icon: ShieldAlert },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Audit Logs" subtitle="Review security, staff, user, payment, and operational activity across the platform." />
   

      <section className="grid gap-4 ">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search actor, role, action, module, IP or description..." value={query} onChange={setQuery} />
            <FilterSelect placeholder="All Statuses" values={["All Statuses", "Success", "Failed", "Warning"]} value={status} onChange={setStatus} className="lg:w-[160px]" />
            <FilterSelect placeholder="All Modules" values={modules} value={module} onChange={setModule} className="lg:w-[180px]" />
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-9 bg-card lg:w-[150px]" aria-label="From date" />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-9 bg-card lg:w-[150px]" aria-label="To date" />
            <ExportButton />
          </ToolbarCard>
          {logsQuery.isLoading ? (
            <div className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground">
              <Clock3 className="h-4 w-4 animate-spin" />
              Loading audit logs...
            </div>
          ) : logsQuery.isError ? (
            <div className="p-6 text-sm font-semibold text-red-600">Unable to load audit logs. Check the console for the API error details.</div>
          ) : (
            <AdminDataTable data={filteredRows} columns={auditColumns} minWidth="1360px" rowLabel="audit events" />
          )}
        </CardShell>

       
      </section>
    </div>
  );
}
