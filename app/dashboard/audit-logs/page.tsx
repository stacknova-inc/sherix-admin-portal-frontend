"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, CheckCircle2, Eye, FileText, Loader2, ShieldAlert, UserRoundCog } from "lucide-react";
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
import { DetailGrid, DetailSection } from "@/components/shared/DetailField";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuditLogs, useAuditStats } from "@/hooks/useAudit";
import { AUDIT_ENTITY_TYPE_OPTIONS, AUDIT_OUTCOME_OPTIONS, canViewAuditSensitiveDetails, formatAuditTimestamp, maskAuditPayload, safeAuditEntityHref } from "@/lib/audit";
import { asRecord, firstText, initials, metricChange, metricDirection, metricValue, text } from "@/lib/live-data";
import { useUiStore } from "@/store/use-ui-store";
import type { AuditLog, AuditLogListParams } from "@/services/audit";

type AuditRow = {
  id: string;
  actorName: string;
  actorEmail: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  targetHref?: string;
  reason: string;
  result: string;
  status: string;
  timestampDisplay: string;
  timestampIso: string;
  initials: string;
  raw: AuditLog;
};

function normalizeStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("fail") || normalized.includes("error") || normalized.includes("denied")) return "Failed";
  if (normalized.includes("warn")) return "Warning";
  if (normalized.includes("success") || normalized.includes("complete")) return "Success";
  return status || "Unknown";
}

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

function mapAuditLog(log: AuditLog, role: string | null | undefined): AuditRow {
  const record = log as Record<string, unknown>;
  const actor = asRecord(record.user ?? record.admin ?? record.actor ?? record.performedBy ?? record.createdBy);
  const actorName = text(
    record.user ?? record.admin ?? record.actor ?? record.performedBy ?? record.createdBy,
    firstText(record, ["userName", "adminName", "actorName", "performedByName", "name"], "System"),
  );
  const timestampSource = record.timestamp ?? record.createdAt ?? record.time ?? record.date;
  const timestamp = formatAuditTimestamp(timestampSource);
  const action = firstText(record, ["action", "actionType", "event", "activity"], "Activity");
  const entityType = firstText(record, ["entityType", "resourceType", "targetType", "resource", "module"], "");
  const entityId = firstText(record, ["entityId", "resourceId", "targetId"], "");

  return {
    id: String(record.id ?? record._id ?? ""),
    actorName,
    actorEmail: firstText(actor, ["email"], firstText(record, ["email", "actorEmail", "adminEmail"], "-")),
    role: firstText(actor, ["role"], firstText(record, ["role", "actorRole", "adminRole"], "Admin")),
    action,
    entityType,
    entityId,
    targetHref: safeAuditEntityHref(entityType, entityId, role),
    reason: firstText(record, ["reason", "note"], ""),
    result: firstText(record, ["result", "outcome"], ""),
    status: normalizeStatus(firstText(record, ["status", "result", "outcome"], "Success")),
    timestampDisplay: timestamp.display,
    timestampIso: timestamp.iso,
    initials: initials(actorName),
    raw: log,
  };
}

function AuditDetailDialog({ row, canViewSensitive, onClose }: { row: AuditRow; canViewSensitive: boolean; onClose: () => void }) {
  const record = row.raw as unknown as Record<string, unknown>;
  const before = record.before !== undefined ? maskAuditPayload(record.before, canViewSensitive) : undefined;
  const after = record.after !== undefined ? maskAuditPayload(record.after, canViewSensitive) : undefined;
  const changes = record.changes !== undefined ? maskAuditPayload(record.changes, canViewSensitive) : undefined;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row.action}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <DetailSection title="Event">
            <DetailGrid
              fields={[
                ["Timestamp", <span key="ts" title={row.timestampIso || undefined}>{row.timestampDisplay}</span>],
                ["Actor", `${row.actorName} (${row.actorEmail})`],
                ["Role", row.role],
                ["Action", row.action],
                [
                  "Target",
                  row.entityType || row.entityId ? (
                    row.targetHref ? (
                      <Link key="target" href={row.targetHref} className="font-bold text-primary hover:underline">
                        {row.entityType || "record"} {row.entityId}
                      </Link>
                    ) : (
                      <span key="target">
                        {row.entityType || "record"} {row.entityId}
                        {row.entityId && !row.targetHref && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">(no accessible record link for your role)</span>
                        )}
                      </span>
                    )
                  ) : (
                    "Not available"
                  ),
                ],
                ["Result / Outcome", row.result || row.status],
                ["Reason", row.reason || "Not available"],
              ]}
            />
          </DetailSection>

          {(before !== undefined || after !== undefined || changes !== undefined) && (
            <DetailSection title="Before / after detail">
              <p className="mb-2 text-xs text-muted-foreground">
                Sensitive fields (credentials, financial identifiers) are always masked. Evidence and document fields are
                {canViewSensitive ? " visible to your role." : " restricted for your role."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {before !== undefined && (
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <p className="mb-1 text-xs font-black uppercase text-muted-foreground">Before</p>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(before, null, 2)}</pre>
                  </div>
                )}
                {after !== undefined && (
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <p className="mb-1 text-xs font-black uppercase text-muted-foreground">After</p>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(after, null, 2)}</pre>
                  </div>
                )}
                {changes !== undefined && (
                  <div className="rounded-xl border bg-muted/30 p-3 sm:col-span-2">
                    <p className="mb-1 text-xs font-black uppercase text-muted-foreground">Changes</p>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(changes, null, 2)}</pre>
                  </div>
                )}
              </div>
            </DetailSection>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AuditLogsPageInner() {
  const searchParams = useSearchParams();
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const canViewSensitive = canViewAuditSensitiveDetails(role);

  const [query, setQuery] = React.useState("");
  const [outcome, setOutcome] = React.useState("All Outcomes");
  const [entityType, setEntityType] = React.useState(searchParams.get("entityType") ?? "All Entity Types");
  const [actorFilter, setActorFilter] = React.useState(searchParams.get("actor") ?? "");
  const [actionFilter, setActionFilter] = React.useState("All Actions");
  const [entityId, setEntityId] = React.useState(searchParams.get("entityId") ?? "");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedRow, setSelectedRow] = React.useState<AuditRow | undefined>(undefined);

  const params = React.useMemo<AuditLogListParams>(
    () => ({
      search: query.trim() || undefined,
      actor: actorFilter.trim() || undefined,
      action: actionFilter === "All Actions" ? undefined : actionFilter,
      entityType: entityType === "All Entity Types" ? undefined : entityType,
      entityId: entityId.trim() || undefined,
      outcome: outcome === "All Outcomes" ? undefined : outcome.toLowerCase(),
      startDate: fromDate || undefined,
      endDate: toDate || undefined,
      page,
      limit: 20,
    }),
    [actionFilter, actorFilter, entityId, entityType, fromDate, outcome, page, query, toDate],
  );

  const logsQuery = useAuditLogs(params);
  const statsQuery = useAuditStats();
  const rows = React.useMemo(() => (logsQuery.data?.data ?? []).map((log) => mapAuditLog(log, role)), [logsQuery.data, role]);

  const entityTypeOptions = React.useMemo(() => {
    const dynamic = Array.from(new Set(rows.map((row) => row.entityType).filter(Boolean)));
    const known = AUDIT_ENTITY_TYPE_OPTIONS.map((option) => option.value);
    return ["All Entity Types", ...Array.from(new Set([...known, ...dynamic]))];
  }, [rows]);

  const actionOptions = React.useMemo(() => ["All Actions", ...Array.from(new Set(rows.map((row) => row.action).filter(Boolean))).sort()], [rows]);

  // Defensive client-side refinement in addition to the server params above: keeps
  // filtering correct even if the backend does not (yet) honor every query param.
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
    const actorSearch = actorFilter.trim().toLowerCase();
    const entityIdSearch = entityId.trim().toLowerCase();

    return rows.filter((row) => {
      const haystack = [row.actorName, row.actorEmail, row.role, row.action, row.entityType, row.entityId, row.reason, row.status].join(" ").toLowerCase();
      const created = row.timestampIso ? new Date(row.timestampIso) : null;
      const matchesSearch = !search || haystack.includes(search);
      const matchesOutcome = outcome === "All Outcomes" || row.status === outcome;
      const matchesEntityType = entityType === "All Entity Types" || row.entityType === entityType;
      const matchesAction = actionFilter === "All Actions" || row.action === actionFilter;
      const matchesActor = !actorSearch || row.actorName.toLowerCase().includes(actorSearch) || row.actorEmail.toLowerCase().includes(actorSearch);
      const matchesEntityId = !entityIdSearch || row.entityId.toLowerCase().includes(entityIdSearch);
      const matchesFrom = !from || (created && created >= from);
      const matchesTo = !to || (created && created <= to);
      return matchesSearch && matchesOutcome && matchesEntityType && matchesAction && matchesActor && matchesEntityId && matchesFrom && matchesTo;
    });
  }, [actionFilter, actorFilter, entityId, entityType, fromDate, outcome, query, rows, toDate]);

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
    { label: "Unique Actors", value: metricValue(stats, ["uniqueUsers", "uniqueAdmins", "users"], String(derivedMetrics.uniqueActors)), change: metricChange(stats, ["uniqueUsers", "uniqueAdmins", "users"], "Distinct actors"), direction: metricDirection(stats, ["uniqueUsers", "uniqueAdmins", "users"]), tone: "blue", icon: UserRoundCog },
    { label: "Successful", value: metricValue(stats, ["successfulEvents", "success"], String(derivedMetrics.success)), change: metricChange(stats, ["successfulEvents", "success"], "Completed actions"), direction: metricDirection(stats, ["successfulEvents", "success"]), tone: "green", icon: CheckCircle2 },
    { label: "Warnings", value: metricValue(stats, ["warningEvents", "warnings"], String(derivedMetrics.warning)), change: metricChange(stats, ["warningEvents", "warnings"], "Review recommended"), direction: metricDirection(stats, ["warningEvents", "warnings"], "down"), tone: "amber", icon: AlertTriangle },
    { label: "Failed", value: metricValue(stats, ["failedAttempts", "failed", "failures"], String(derivedMetrics.failed)), change: metricChange(stats, ["failedAttempts", "failed", "failures"], "Needs attention"), direction: metricDirection(stats, ["failedAttempts", "failed", "failures"], "down"), tone: "red", icon: ShieldAlert },
  ];

  const exportData = React.useMemo(
    () =>
      filteredRows.map(({ id, actorName, actorEmail, role: actorRole, action, entityType: type, entityId: targetId, reason, result, status, timestampDisplay }) => ({
        id,
        actorName,
        actorEmail,
        role: actorRole,
        action,
        entityType: type,
        entityId: targetId,
        reason,
        result: result || status,
        timestamp: timestampDisplay,
      })),
    [filteredRows],
  );

  const auditColumns: ColumnDef<AuditRow>[] = [
    { accessorKey: "id", header: "#", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
    { accessorKey: "action", header: "Action", cell: ({ row }) => <SoftTag tone={toneForAction(row.original.action)}>{row.original.action}</SoftTag> },
    {
      accessorKey: "actorName",
      header: "Actor",
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
    {
      accessorKey: "entityType",
      header: "Target",
      cell: ({ row }) =>
        row.original.entityType || row.original.entityId ? (
          row.original.targetHref ? (
            <Link href={row.original.targetHref} className="inline-block min-w-[160px] font-semibold text-primary hover:underline">
              {row.original.entityType || "record"} {row.original.entityId}
            </Link>
          ) : (
            <span className="inline-block min-w-[160px] font-semibold text-muted-foreground">
              {row.original.entityType || "record"} {row.original.entityId}
            </span>
          )
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    { accessorKey: "status", header: "Outcome", cell: ({ row }) => <StatusCell status={row.original.status} /> },
    {
      accessorKey: "timestampDisplay",
      header: "Date & Time",
      cell: ({ row }) => (
        <span className="min-w-[170px] font-semibold" title={row.original.timestampIso || undefined}>
          {row.original.timestampDisplay}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedRow(row.original)}>
          <Eye className="h-4 w-4" />
          View details
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Audit Logs" subtitle="Read-only record of security, staff, customer, payment, and operational activity across the platform. Sensitive values are masked according to your role." />
      <MetricGrid metrics={metrics} />

      <section className="grid gap-4">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search actor, role, action, target or reason..." value={query} onChange={setQuery} />
            <FilterSelect placeholder="All Outcomes" values={["All Outcomes", ...AUDIT_OUTCOME_OPTIONS]} value={outcome} onChange={setOutcome} className="lg:w-[160px]" />
            <FilterSelect placeholder="All Entity Types" values={entityTypeOptions} value={entityType} onChange={setEntityType} className="lg:w-[180px]" />
            <FilterSelect placeholder="All Actions" values={actionOptions} value={actionFilter} onChange={setActionFilter} className="lg:w-[170px]" />
          </ToolbarCard>
          <ToolbarCard>
            <Input placeholder="Filter by actor (name or email)" value={actorFilter} onChange={(event) => setActorFilter(event.target.value)} className="h-9 bg-card lg:max-w-[220px]" aria-label="Filter by actor" />
            <Input placeholder="Filter by entity ID" value={entityId} onChange={(event) => setEntityId(event.target.value)} className="h-9 bg-card lg:max-w-[200px]" aria-label="Filter by entity ID" />
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-9 bg-card lg:w-[150px]" aria-label="From date" />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-9 bg-card lg:w-[150px]" aria-label="To date" />
            {(actorFilter || entityId || fromDate || toDate || entityType !== "All Entity Types" || actionFilter !== "All Actions" || outcome !== "All Outcomes" || query) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setOutcome("All Outcomes");
                  setEntityType("All Entity Types");
                  setActionFilter("All Actions");
                  setActorFilter("");
                  setEntityId("");
                  setFromDate("");
                  setToDate("");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
            <ExportButton data={exportData} filename="audit-logs" />
          </ToolbarCard>
          {logsQuery.isLoading ? (
            <div role="status" aria-live="polite" className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading audit logs...
            </div>
          ) : logsQuery.isError ? (
            <div role="alert" className="flex flex-wrap items-center gap-3 p-6 text-sm font-semibold text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Unable to load audit logs.
              <Button size="sm" variant="outline" onClick={() => void logsQuery.refetch()}>Retry</Button>
            </div>
          ) : !filteredRows.length ? (
            <div className="p-4">
              <EmptyState title="No audit events found" description="Try a different search, or a broader date range and filter combination." />
            </div>
          ) : (
            <AdminDataTable
              data={filteredRows}
              columns={auditColumns}
              minWidth="1360px"
              rowLabel="audit events"
              serverPagination={logsQuery.data?.serverPaginated ? { ...logsQuery.data.pagination, onPageChange: setPage } : undefined}
            />
          )}
        </CardShell>
      </section>

      {selectedRow && <AuditDetailDialog row={selectedRow} canViewSensitive={canViewSensitive} onClose={() => setSelectedRow(undefined)} />}
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <React.Suspense fallback={<div role="status" aria-live="polite" className="p-6 text-sm font-semibold text-muted-foreground">Loading audit logs...</div>}>
      <AuditLogsPageInner />
    </React.Suspense>
  );
}
