"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, History, Layers, Loader2, MoreVertical, Pencil, Percent, Plus, PowerOff } from "lucide-react";
import Link from "next/link";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { ExportButton, FilterSelect, MetricGrid, SearchBox, SoftTag, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage, isApiConflict } from "@/lib/api";
import { dateText, recordId, text } from "@/lib/live-data";
import { hasPermission, Permission } from "@/lib/rbac";
import { useUiStore } from "@/store/use-ui-store";
import { useServices } from "@/hooks/useServices";
import {
  useBulkUpdateCommissions,
  useCommission,
  useCommissions,
  useCreateCommission,
  useDeactivateCommission,
  useUpdateCommission,
} from "@/hooks/useCommissions";
import type { BulkCommissionEntry, Commission } from "@/types";

type StatusFilter = "All Statuses" | "Active" | "Inactive";

function decimalInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("")}` : cleaned;
}

function toDateInput(value?: string | null) {
  return value ? String(value).slice(0, 10) : "";
}

function toIsoStart(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined;
}

function toIsoEnd(value: string) {
  return value ? new Date(`${value}T23:59:59.000Z`).toISOString() : null;
}

function serviceNameFor(commission: Commission, services: { _id?: string; id?: string; name?: string; title?: string }[]) {
  if (commission.serviceName) return commission.serviceName;
  const match = services.find((service) => recordId(service) === String(commission.serviceId ?? ""));
  return match ? text(match.name ?? match.title, "-") : "-";
}

function FormField({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold">
      <span>{label}</span>
      {children}
      {(error || hint) && <span className={error ? "text-xs font-semibold text-red-600" : "text-xs text-muted-foreground"}>{error ?? hint}</span>}
    </label>
  );
}

function AddCommissionDialog({
  open,
  services,
  commissions,
  onOpenChange,
  onSaved,
  onError,
}: {
  open: boolean;
  services: { _id?: string; id?: string; name?: string; title?: string }[];
  commissions: Commission[];
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const createCommission = useCreateCommission();
  const [serviceId, setServiceId] = React.useState("");
  const [percent, setPercent] = React.useState("");
  const [effectiveFrom, setEffectiveFrom] = React.useState("");
  const [effectiveTo, setEffectiveTo] = React.useState("");
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setServiceId("");
    setPercent("");
    setEffectiveFrom(new Date().toISOString().slice(0, 10));
    setEffectiveTo("");
    setReason("");
  }, [open]);

  const existingForService = commissions.find((commission) => String(commission.serviceId ?? "") === serviceId && commission.isActive !== false);
  const percentValue = Number(percent);
  const percentError = percent !== "" && (percentValue < 0 || percentValue > 100) ? "Percentage must be between 0 and 100." : undefined;
  const requiredError = !serviceId || !percent || !effectiveFrom || !reason.trim() ? "Service, percentage, effective date, and reason are required." : undefined;
  const isPending = createCommission.isPending;
  const canSubmit = !percentError && !requiredError && !isPending;

  async function submit() {
    if (!canSubmit) return;
    try {
      await createCommission.mutateAsync({
        serviceId,
        commissionPercent: percentValue,
        effectiveFrom: toIsoStart(effectiveFrom),
        effectiveTo: effectiveTo ? toIsoEnd(effectiveTo) : null,
        expectedVersion: existingForService?.version ?? 0,
        reason: reason.trim(),
      });
      onSaved("Commission saved successfully.");
      onOpenChange(false);
    } catch (error) {
      if (isApiConflict(error)) {
        onError("This service's commission changed elsewhere since the page loaded. Refresh the list and try again.");
        return;
      }
      onError(getErrorMessage(error, "Unable to save commission."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Commission</DialogTitle>
          <DialogDescription>
            Set the effective commission for a service. This replaces the currently active commission for that service — the previous one is deactivated
            automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField label="Service">
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger><SelectValue placeholder={services.length ? "Select service" : "No services available"} /></SelectTrigger>
              <SelectContent className="bg-white">
                {services.map((service) => (
                  <SelectItem key={recordId(service)} value={recordId(service)}>{text(service.name ?? service.title, "Untitled service")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {existingForService && (
            <p className="rounded-lg border border-amber-300/60 bg-amber-50 p-2.5 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              This service currently has an active commission of {existingForService.commissionPercent ?? existingForService.effectivePercent}%. Saving will
              deactivate it and apply the new rate below.
            </p>
          )}
          <FormField label="Commission Percentage (%)" error={percentError}>
            <Input value={percent} onChange={(event) => setPercent(decimalInput(event.target.value))} inputMode="decimal" placeholder="15" />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Effective From">
              <Input type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} className="bg-card" />
            </FormField>
            <FormField label="Effective To" hint="Optional — leave blank for no expiry.">
              <Input type="date" value={effectiveTo} onChange={(event) => setEffectiveTo(event.target.value)} className="bg-card" />
            </FormField>
          </div>
          <FormField label="Reason" hint="Recorded for audit purposes.">
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Set commission for this service" />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Commission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditCommissionDialog({
  open,
  commissionId,
  services,
  onOpenChange,
  onSaved,
  onError,
}: {
  open: boolean;
  commissionId?: string;
  services: { _id?: string; id?: string; name?: string; title?: string }[];
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const detailQuery = useCommission(open ? commissionId : undefined);
  const updateCommission = useUpdateCommission();
  const commission = detailQuery.data;
  const [percent, setPercent] = React.useState("");
  const [resetToDefault, setResetToDefault] = React.useState(false);
  const [effectiveFrom, setEffectiveFrom] = React.useState("");
  const [effectiveTo, setEffectiveTo] = React.useState("");
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (!open || !commission) return;
    setPercent(commission.commissionPercent !== null && commission.commissionPercent !== undefined ? String(commission.commissionPercent) : "");
    setResetToDefault(commission.commissionPercent === null);
    setEffectiveFrom(toDateInput(commission.effectiveFrom));
    setEffectiveTo(toDateInput(commission.effectiveTo));
    setReason("");
  }, [open, commission]);

  const percentValue = Number(percent);
  const percentError = !resetToDefault && percent !== "" && (percentValue < 0 || percentValue > 100) ? "Percentage must be between 0 and 100." : undefined;
  const requiredError = !resetToDefault && (!percent || !effectiveFrom) ? "Percentage and effective date are required." : undefined;
  const isPending = updateCommission.isPending;
  const canSubmit = Boolean(commission) && !percentError && !requiredError && !isPending;

  async function submit() {
    if (!canSubmit || !commission) return;
    const id = recordId(commission);
    try {
      await updateCommission.mutateAsync({
        id,
        payload: {
          serviceId: String(commission.serviceId ?? ""),
          commissionPercent: resetToDefault ? null : percentValue,
          effectiveFrom: resetToDefault ? undefined : toIsoStart(effectiveFrom),
          effectiveTo: resetToDefault ? undefined : effectiveTo ? toIsoEnd(effectiveTo) : null,
          expectedVersion: commission.version ?? 0,
          reason: reason.trim() || (resetToDefault ? "Reset to global default" : undefined),
        },
      });
      onSaved("Commission updated successfully.");
      onOpenChange(false);
    } catch (error) {
      if (isApiConflict(error)) {
        onError("This commission was changed by another administrator. Refresh the list and try again.");
        return;
      }
      onError(getErrorMessage(error, "Unable to update commission."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Commission</DialogTitle>
          <DialogDescription>{commission ? `Editing the commission for ${serviceNameFor(commission, services)}.` : "Loading commission details..."}</DialogDescription>
        </DialogHeader>
        {detailQuery.isLoading ? (
          <div className="flex items-center gap-2 p-4 text-sm font-semibold text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div>
        ) : detailQuery.isError ? (
          <div className="p-4 text-sm font-semibold text-red-600">{getErrorMessage(detailQuery.error, "Unable to load this commission.")}</div>
        ) : (
          <div className="grid gap-4">
            <label className="flex items-center gap-2 text-xs font-bold">
              <input type="checkbox" checked={resetToDefault} onChange={(event) => setResetToDefault(event.target.checked)} className="h-4 w-4" />
              Reset this service to the global default commission
            </label>
            {!resetToDefault && (
              <>
                <FormField label="Commission Percentage (%)" error={percentError}>
                  <Input value={percent} onChange={(event) => setPercent(decimalInput(event.target.value))} inputMode="decimal" />
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Effective From">
                    <Input type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} className="bg-card" />
                  </FormField>
                  <FormField label="Effective To" hint="Optional — leave blank for no expiry.">
                    <Input type="date" value={effectiveTo} onChange={(event) => setEffectiveTo(event.target.value)} className="bg-card" />
                  </FormField>
                </div>
              </>
            )}
            <FormField label="Reason" hint="Recorded for audit purposes.">
              <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for this change" />
            </FormField>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeactivateCommissionDialog({
  open,
  commission,
  services,
  onOpenChange,
  onSaved,
  onError,
}: {
  open: boolean;
  commission?: Commission;
  services: { _id?: string; id?: string; name?: string; title?: string }[];
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const deactivateCommission = useDeactivateCommission();
  if (!commission) return null;
  const id = recordId(commission);
  const serviceName = serviceNameFor(commission, services);

  async function confirm() {
    try {
      await deactivateCommission.mutateAsync(id);
      onSaved(`Commission for ${serviceName} deactivated successfully.`);
      onOpenChange(false);
    } catch (error) {
      if (isApiConflict(error)) {
        onError("This commission was changed by another administrator. Refresh the list and try again.");
        return;
      }
      onError(getErrorMessage(error, "Unable to deactivate commission."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate commission for "{serviceName}"?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-left">
              <p>
                Current rate: <span className="font-bold text-foreground">{commission.commissionPercent ?? commission.effectivePercent ?? "-"}%</span>
              </p>
              <p>
                Once deactivated, this service falls back to the platform's global default commission rate (configured under Operational Settings) until a
                new per-service commission is set.
              </p>
              <p>This does not affect commission already applied to past, completed requests.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deactivateCommission.isPending}>Cancel</Button>
          <Button variant="destructive" onClick={() => void confirm()} disabled={deactivateCommission.isPending}>
            {deactivateCommission.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type BulkRow = { serviceId: string; include: boolean; resetToDefault: boolean; percent: string; effectiveFrom: string; effectiveTo: string };

function BulkUpdateDialog({
  open,
  services,
  commissions,
  onOpenChange,
  onSaved,
  onError,
}: {
  open: boolean;
  services: { _id?: string; id?: string; name?: string; title?: string }[];
  commissions: Commission[];
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const bulkUpdate = useBulkUpdateCommissions();
  const [reason, setReason] = React.useState("");
  const [effectiveFrom, setEffectiveFrom] = React.useState("");
  const [rows, setRows] = React.useState<BulkRow[]>([]);

  React.useEffect(() => {
    if (!open) return;
    setReason("");
    setEffectiveFrom(new Date().toISOString().slice(0, 10));
    setRows(services.map((service) => ({ serviceId: recordId(service), include: false, resetToDefault: false, percent: "", effectiveFrom: "", effectiveTo: "" })));
  }, [open, services]);

  function updateRow(serviceId: string, patch: Partial<BulkRow>) {
    setRows((current) => current.map((row) => (row.serviceId === serviceId ? { ...row, ...patch } : row)));
  }

  const includedRows = rows.filter((row) => row.include);
  const rowErrors = includedRows.some((row) => !row.resetToDefault && (row.percent === "" || Number(row.percent) < 0 || Number(row.percent) > 100));
  const isPending = bulkUpdate.isPending;
  const canSubmit = includedRows.length > 0 && reason.trim().length > 0 && !rowErrors && !isPending;

  async function submit() {
    if (!canSubmit) return;
    const entries: BulkCommissionEntry[] = includedRows.map((row) => {
      const existing = commissions.find((commission) => String(commission.serviceId ?? "") === row.serviceId && commission.isActive !== false);
      if (row.resetToDefault) {
        return { serviceId: row.serviceId, commissionPercent: null, expectedVersion: existing?.version ?? 0, reason: "Reset this service to the global default" };
      }
      return {
        serviceId: row.serviceId,
        commissionPercent: Number(row.percent),
        effectiveFrom: toIsoStart(row.effectiveFrom || effectiveFrom),
        effectiveTo: row.effectiveTo ? toIsoEnd(row.effectiveTo) : null,
        expectedVersion: existing?.version ?? 0,
      };
    });
    try {
      await bulkUpdate.mutateAsync({ reason: reason.trim(), commissions: entries });
      onSaved(`Updated commissions for ${entries.length} service${entries.length === 1 ? "" : "s"}.`);
      onOpenChange(false);
    } catch (error) {
      if (isApiConflict(error)) {
        onError("One or more of these commissions changed elsewhere since the page loaded. Refresh the list and try again.");
        return;
      }
      onError(getErrorMessage(error, "Unable to bulk update commissions."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Update Commissions</DialogTitle>
          <DialogDescription>Select the services to update. Unselected services are left unchanged.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField label="Default Effective From" hint="Used for rows that don't set their own date.">
            <Input type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} className="bg-card" />
          </FormField>
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border p-3">
            {rows.map((row) => {
              const service = services.find((item) => recordId(item) === row.serviceId);
              return (
                <div key={row.serviceId} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-b pb-2 last:border-0 last:pb-0 sm:grid-cols-[auto_140px_90px_1fr_1fr]">
                  <input type="checkbox" checked={row.include} onChange={(event) => updateRow(row.serviceId, { include: event.target.checked })} className="mt-2 h-4 w-4" />
                  <span className="mt-1.5 truncate text-sm font-bold">{text(service?.name ?? service?.title, "Untitled service")}</span>
                  <label className="flex items-center gap-1.5 text-xs font-semibold">
                    <input type="checkbox" checked={row.resetToDefault} onChange={(event) => updateRow(row.serviceId, { resetToDefault: event.target.checked })} disabled={!row.include} className="h-3.5 w-3.5" />
                    Default
                  </label>
                  <Input
                    value={row.percent}
                    onChange={(event) => updateRow(row.serviceId, { percent: decimalInput(event.target.value) })}
                    disabled={!row.include || row.resetToDefault}
                    inputMode="decimal"
                    placeholder="%"
                    className="h-8"
                  />
                  <Input
                    type="date"
                    value={row.effectiveTo}
                    onChange={(event) => updateRow(row.serviceId, { effectiveTo: event.target.value })}
                    disabled={!row.include || row.resetToDefault}
                    className="h-8 bg-card"
                    aria-label="Effective to (optional)"
                  />
                </div>
              );
            })}
          </div>
          <FormField label="Reason" hint="Required — applies to this whole bulk update.">
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Quarterly rate review" />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Update {includedRows.length || ""} Service{includedRows.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommissionActions({
  commission,
  allowed,
  onEdit,
  onDeactivate,
}: {
  commission: Commission;
  allowed: boolean;
  onEdit: (commission: Commission) => void;
  onDeactivate: (commission: Commission) => void;
}) {
  const active = commission.isActive !== false;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Commission actions" disabled={!allowed}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(commission)}>
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        {active && (
          <DropdownMenuItem onSelect={() => onDeactivate(commission)} className="text-red-600 focus:text-red-600">
            <PowerOff className="h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CommissionsPage() {
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const allowed = hasPermission(role, Permission.SERVICES);
  const commissionsQuery = useCommissions();
  const servicesQuery = useServices();
  const commissions = commissionsQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("All Statuses");
  const [toast, setToast] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [editCommissionId, setEditCommissionId] = React.useState<string | undefined>();
  const [deactivateCommission, setDeactivateCommission] = React.useState<Commission | undefined>();

  const filtered = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return commissions.filter((commission) => {
      const active = commission.isActive !== false;
      const label = active ? "Active" : "Inactive";
      const haystack = [serviceNameFor(commission, services), commission.source, label].join(" ").toLowerCase();
      const matchesStatus = status === "All Statuses" || label === status;
      return (!search || haystack.includes(search)) && matchesStatus;
    });
  }, [commissions, query, services, status]);

  const metrics = React.useMemo(() => {
    const activeCount = commissions.filter((commission) => commission.isActive !== false).length;
    return [
      { label: "Total Commission Records", value: String(commissions.length) },
      { label: "Active", value: String(activeCount) },
      { label: "Inactive", value: String(commissions.length - activeCount) },
    ];
  }, [commissions]);

  const exportData = React.useMemo(
    () =>
      filtered.map((commission) => ({
        service: serviceNameFor(commission, services),
        commissionPercent: commission.commissionPercent ?? commission.effectivePercent ?? "-",
        effectiveFrom: dateText(commission.effectiveFrom),
        effectiveTo: commission.effectiveTo ? dateText(commission.effectiveTo) : "No expiry",
        source: commission.source ?? "-",
        status: commission.isActive !== false ? "Active" : "Inactive",
      })),
    [filtered, services],
  );

  const columns: ColumnDef<Commission>[] = [
    {
      id: "service",
      header: "Service",
      cell: ({ row }) => (
        <div className="flex min-w-[180px] items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Percent className="h-4 w-4" /></span>
          <span className="font-black">{serviceNameFor(row.original, services)}</span>
        </div>
      ),
    },
    {
      id: "percent",
      header: "Commission",
      cell: ({ row }) => <span className="font-bold">{row.original.commissionPercent ?? row.original.effectivePercent ?? "-"}%</span>,
    },
    { id: "effectiveFrom", header: "Effective From", cell: ({ row }) => <span className="font-semibold">{dateText(row.original.effectiveFrom)}</span> },
    { id: "effectiveTo", header: "Effective To", cell: ({ row }) => <span className="font-semibold">{row.original.effectiveTo ? dateText(row.original.effectiveTo) : "No expiry"}</span> },
    { id: "source", header: "Source", cell: ({ row }) => <SoftTag tone={row.original.source === "custom" ? "blue" : "slate"}>{row.original.source ?? "-"}</SoftTag> },
    { id: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.isActive !== false ? "Active" : "Inactive"} /> },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <CommissionActions
          commission={row.original}
          allowed={allowed}
          onEdit={(commission) => setEditCommissionId(recordId(commission))}
          onDeactivate={setDeactivateCommission}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Commissions" subtitle="Manage per-service commission rates. Services without a custom rate use the global default." />
        <Button variant="outline" className="bg-card" asChild>
          <Link href="/dashboard/audit-logs">
            <History className="h-4 w-4" />
            View Audit History
          </Link>
        </Button>
      </div>

      <MetricGrid metrics={metrics.map((metric) => ({ ...metric, change: "Live backend data", direction: "up", tone: "green", icon: Percent }))} columns="xl:grid-cols-3" />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search commissions by service or source..." value={query} onChange={setQuery} />
          <FilterSelect placeholder="All Statuses" values={["All Statuses", "Active", "Inactive"]} value={status} onChange={(value) => setStatus(value as StatusFilter)} />
          <div className="flex flex-wrap gap-3">
            <ExportButton data={exportData} filename="commissions" />
            <Button variant="outline" className="bg-card" onClick={() => setBulkOpen(true)} disabled={!allowed || !services.length}>
              <Layers className="h-4 w-4" />
              Bulk Update
            </Button>
            <Button onClick={() => setAddOpen(true)} disabled={!allowed || !services.length}>
              <Plus className="h-4 w-4" />
              Add Commission
            </Button>
          </div>
        </ToolbarCard>

        {!allowed ? (
          <div className="p-6"><EmptyState title="You don't have permission to view this page" description="Contact an administrator if you believe this is a mistake." /></div>
        ) : commissionsQuery.isLoading || servicesQuery.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading commissions...
          </div>
        ) : commissionsQuery.isError ? (
          <div className="flex flex-col items-start gap-3 p-6 text-sm font-semibold text-red-600 sm:flex-row sm:items-center">
            <AlertTriangle className="h-4 w-4" />
            {getErrorMessage(commissionsQuery.error, "Unable to load commissions.")}
            <Button size="sm" variant="outline" onClick={() => void commissionsQuery.refetch()}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={query || status !== "All Statuses" ? "No commissions match the current filters." : "No per-service commissions set"}
              description={
                query || status !== "All Statuses"
                  ? "Try a different search term or filter."
                  : "Services without a custom commission use the global default rate from Operational Settings."
              }
            />
          </div>
        ) : (
          <AdminDataTable data={filtered} columns={columns} minWidth="1180px" rowLabel="commissions" />
        )}
      </CardShell>

      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl">{toast}</div>}

      {allowed && (
        <>
          <AddCommissionDialog
            open={addOpen}
            services={services}
            commissions={commissions}
            onOpenChange={setAddOpen}
            onSaved={setToast}
            onError={setToast}
          />
          <EditCommissionDialog
            open={editCommissionId !== undefined}
            commissionId={editCommissionId}
            services={services}
            onOpenChange={(open) => !open && setEditCommissionId(undefined)}
            onSaved={setToast}
            onError={setToast}
          />
          <DeactivateCommissionDialog
            open={deactivateCommission !== undefined}
            commission={deactivateCommission}
            services={services}
            onOpenChange={(open) => !open && setDeactivateCommission(undefined)}
            onSaved={setToast}
            onError={setToast}
          />
          <BulkUpdateDialog
            open={bulkOpen}
            services={services}
            commissions={commissions}
            onOpenChange={setBulkOpen}
            onSaved={setToast}
            onError={setToast}
          />
        </>
      )}
    </div>
  );
}
