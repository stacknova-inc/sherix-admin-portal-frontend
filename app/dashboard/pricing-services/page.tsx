"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, History, Loader2, MoreVertical, Pencil, Plus, Power, PowerOff, Receipt } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { ExportButton, FilterSelect, MetricGrid, SearchBox, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { getErrorMessage, isApiConflict } from "@/lib/api";
import { asRecord, dateText, money, recordId, text } from "@/lib/live-data";
import { hasPermission, Permission } from "@/lib/rbac";
import { useUiStore } from "@/store/use-ui-store";
import { useServices } from "@/hooks/useServices";
import { useAddIssue, useIssues, useUpdateIssue } from "@/hooks/useIssues";
import { useSettings } from "@/hooks/useSettings";
import type { Issue, Service } from "@/types";

type StatusFilter = "All Statuses" | "Active" | "Inactive";

function isIssueActive(issue: Issue) {
  const record = asRecord(issue);
  if (typeof record.isActive === "boolean") return record.isActive;
  if (typeof record.status === "string") return record.status.toLowerCase() === "active";
  return true;
}

function issueStatusLabel(issue: Issue) {
  return isIssueActive(issue) ? "Active" : "Inactive";
}

function extractCurrency(settings: unknown): string {
  const root = asRecord(settings);
  const general = asRecord(root.general ?? root.generalSettings ?? root.settings);
  const source = Object.keys(general).length ? general : root;
  const localization = asRecord(source.localization ?? source.locale ?? source.regional);
  const raw = localization.defaultCurrency ?? source.currency;
  return typeof raw === "string" && raw ? raw.split(" - ")[0].trim() : "GHS";
}

function serviceNameFor(issue: Issue, services: Service[]) {
  if (issue.service && typeof issue.service === "object") return text(issue.service.name ?? issue.service.title, "-");
  const match = services.find((service) => recordId(service) === String(issue.service ?? ""));
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

function decimalInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("")}` : cleaned;
}

function PricingFormDialog({
  open,
  mode,
  issue,
  issues,
  services,
  currency,
  onOpenChange,
  onSaved,
  onError,
}: {
  open: boolean;
  mode: "create" | "edit";
  issue?: Issue;
  issues: Issue[];
  services: Service[];
  currency: string;
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const addIssue = useAddIssue();
  const updateIssue = useUpdateIssue();
  const [service, setService] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [min, setMin] = React.useState("");
  const [max, setMax] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setService(issue?.service && typeof issue.service === "object" ? recordId(issue.service) : String(issue?.service ?? ""));
    setTitle(text(issue?.issueTitle ?? issue?.title, ""));
    setDescription(text(issue?.issueDescription ?? issue?.description, ""));
    setMin(issue?.issueMinPrice !== undefined ? String(issue.issueMinPrice) : "");
    setMax(issue?.issueMaxPrice !== undefined ? String(issue.issueMaxPrice) : "");
  }, [open, issue]);

  const issueId = issue ? recordId(issue) : "";
  const minValue = Number(min);
  const maxValue = Number(max);
  const requiredError = !service || !title.trim() || !description.trim() || !min || !max ? "All fields are required." : undefined;
  const negativeError = min !== "" && minValue < 0 ? "Minimum price cannot be negative." : max !== "" && maxValue < 0 ? "Maximum price cannot be negative." : undefined;
  const rangeError = min !== "" && max !== "" && minValue >= maxValue ? "Maximum price must be greater than minimum price." : undefined;
  const duplicateError =
    !rangeError && !negativeError && service && title.trim()
      ? issues.some((existing) => {
          const existingId = recordId(existing);
          const existingServiceId = existing.service && typeof existing.service === "object" ? recordId(existing.service) : String(existing.service ?? "");
          const existingTitle = text(existing.issueTitle ?? existing.title, "").trim().toLowerCase();
          return existingId !== issueId && existingServiceId === service && existingTitle === title.trim().toLowerCase();
        })
        ? "A pricing item with this title already exists for the selected service."
        : undefined
      : undefined;
  const priceError = negativeError ?? rangeError;
  const isPending = addIssue.isPending || updateIssue.isPending;
  const canSubmit = !requiredError && !priceError && !duplicateError && !isPending;

  async function submit() {
    if (!canSubmit) return;
    const payload = { service, issueTitle: title.trim(), issueDescription: description.trim(), issueMinPrice: minValue, issueMaxPrice: maxValue };
    try {
      if (mode === "create") {
        await addIssue.mutateAsync(payload);
        onSaved("Pricing item created successfully.");
      } else {
        await updateIssue.mutateAsync({ id: issueId, payload });
        onSaved("Pricing item updated successfully.");
      }
      onOpenChange(false);
    } catch (error) {
      if (isApiConflict(error)) {
        onError("This pricing item was changed by another administrator. Refresh the list and try again.");
        return;
      }
      onError(getErrorMessage(error, mode === "create" ? "Unable to create pricing item." : "Unable to update pricing item."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Pricing Item" : "Edit Pricing Item"}</DialogTitle>
          <DialogDescription>Define the issue, its service, and the expected price range in {currency}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField label="Service">
            <Select value={service} onValueChange={setService}>
              <SelectTrigger><SelectValue placeholder={services.length ? "Select service" : "No services available"} /></SelectTrigger>
              <SelectContent className="bg-white">
                {services.map((item) => (
                  <SelectItem key={recordId(item)} value={recordId(item)}>{text(item.name ?? item.title, "Untitled service")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Title" error={duplicateError} hint={!duplicateError ? "Short, operationally clear name for this pricing item." : undefined}>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Emergency towing" />
          </FormField>
          <FormField label="Description" hint="Add enough context for reviewers.">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              placeholder="Describe the pricing scenario..."
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={`Minimum Price (${currency})`} error={negativeError && min !== "" ? negativeError : rangeError}>
              <Input value={min} onChange={(event) => setMin(decimalInput(event.target.value))} inputMode="decimal" placeholder="100" />
            </FormField>
            <FormField label={`Maximum Price (${currency})`} error={negativeError && max !== "" ? negativeError : undefined}>
              <Input value={max} onChange={(event) => setMax(decimalInput(event.target.value))} inputMode="decimal" placeholder="500" />
            </FormField>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Save Pricing Item" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusChangeDialog({
  open,
  issue,
  services,
  onOpenChange,
  onSaved,
  onError,
}: {
  open: boolean;
  issue?: Issue;
  services: Service[];
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const updateIssue = useUpdateIssue();
  if (!issue) return null;
  const currentlyActive = isIssueActive(issue);
  const issueId = recordId(issue);
  const name = text(issue.issueTitle ?? issue.title, "This pricing item");

  async function confirm() {
    try {
      await updateIssue.mutateAsync({ id: issueId, payload: { isActive: !currentlyActive } });
      onSaved(`${name} was ${currentlyActive ? "deactivated" : "activated"} successfully.`);
      onOpenChange(false);
    } catch (error) {
      if (isApiConflict(error)) {
        onError("This pricing item's status was changed by another administrator. Refresh the list and try again.");
        return;
      }
      onError(getErrorMessage(error, "Unable to update pricing item status."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentlyActive ? "Deactivate" : "Activate"} "{name}"?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-left">
              <p>
                Service: <span className="font-bold text-foreground">{serviceNameFor(issue, services)}</span>
              </p>
              <p>
                Current status: <span className="font-bold text-foreground">{currentlyActive ? "Active" : "Inactive"}</span> — new status:{" "}
                <span className="font-bold text-foreground">{currentlyActive ? "Inactive" : "Active"}</span>.
              </p>
              {currentlyActive ? (
                <p>Deactivating removes this price range from being offered to customers requesting this service. It is not deleted and can be reactivated at any time.</p>
              ) : (
                <p>Activating makes this price range available again for this service.</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateIssue.isPending}>Cancel</Button>
          <Button variant={currentlyActive ? "destructive" : "default"} onClick={() => void confirm()} disabled={updateIssue.isPending}>
            {updateIssue.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {currentlyActive ? "Deactivate" : "Activate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PricingActions({
  issue,
  allowed,
  onEdit,
  onToggleStatus,
}: {
  issue: Issue;
  allowed: boolean;
  onEdit: (issue: Issue) => void;
  onToggleStatus: (issue: Issue) => void;
}) {
  const active = isIssueActive(issue);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${text(issue.issueTitle ?? issue.title, "pricing item")}`} disabled={!allowed}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(issue)}>
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onToggleStatus(issue)} className={active ? "text-red-600 focus:text-red-600" : undefined}>
          {active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          {active ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function PricingServicesPage() {
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const allowed = hasPermission(role, Permission.SERVICES);
  const issuesQuery = useIssues();
  const servicesQuery = useServices();
  const settingsQuery = useSettings();
  const issues = issuesQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const currency = extractCurrency(settingsQuery.data);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("All Statuses");
  const [toast, setToast] = React.useState("");
  const [formDialog, setFormDialog] = React.useState<{ mode: "create" | "edit"; issue?: Issue } | null>(null);
  const [statusDialogIssue, setStatusDialogIssue] = React.useState<Issue | undefined>();

  const filtered = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return issues.filter((issue) => {
      const label = issueStatusLabel(issue);
      const haystack = [issue.issueTitle, issue.title, issue.issueDescription, serviceNameFor(issue, services), label].join(" ").toLowerCase();
      const matchesStatus = status === "All Statuses" || label === status;
      return (!search || haystack.includes(search)) && matchesStatus;
    });
  }, [issues, query, services, status]);

  const metrics = React.useMemo(() => {
    const activeCount = issues.filter(isIssueActive).length;
    return [
      { label: "Total Pricing Items", value: String(issues.length) },
      { label: "Active", value: String(activeCount) },
      { label: "Inactive", value: String(issues.length - activeCount) },
    ];
  }, [issues]);

  const exportData = React.useMemo(
    () =>
      filtered.map((issue) => ({
        title: text(issue.issueTitle ?? issue.title, "-"),
        service: serviceNameFor(issue, services),
        minPrice: issue.issueMinPrice ?? 0,
        maxPrice: issue.issueMaxPrice ?? 0,
        currency,
        status: issueStatusLabel(issue),
        createdAt: dateText(issue.createdAt),
      })),
    [currency, filtered, services],
  );

  const columns: ColumnDef<Issue>[] = [
    {
      id: "title",
      header: "Pricing Item",
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <p className="font-black">{text(row.original.issueTitle ?? row.original.title, "Untitled")}</p>
          <p className="text-xs text-muted-foreground">{serviceNameFor(row.original, services)}</p>
        </div>
      ),
    },
    { id: "min", header: "Minimum", cell: ({ row }) => <span className="font-bold">{money(row.original.issueMinPrice, currency)}</span> },
    { id: "max", header: "Maximum", cell: ({ row }) => <span className="font-bold">{money(row.original.issueMaxPrice, currency)}</span> },
    { id: "createdAt", header: "Created Date", cell: ({ row }) => <span className="font-semibold">{dateText(row.original.createdAt)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <StatusCell status={issueStatusLabel(row.original)} /> },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <PricingActions
          issue={row.original}
          allowed={allowed}
          onEdit={(issue) => setFormDialog({ mode: "edit", issue })}
          onToggleStatus={setStatusDialogIssue}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Pricing & Services" subtitle={`Manage price ranges for services across the marketplace. Values are shown in ${currency}.`} />
        <Button variant="outline" className="bg-card" asChild>
          <Link href="/dashboard/audit-logs">
            <History className="h-4 w-4" />
            View Audit History
          </Link>
        </Button>
      </div>

      <MetricGrid
        metrics={metrics.map((metric) => ({ ...metric, change: "Live backend data", direction: "up", tone: "purple", icon: Receipt }))}
        columns="xl:grid-cols-3"
      />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search pricing items by title, service or description..." value={query} onChange={setQuery} />
          <FilterSelect placeholder="All Statuses" values={["All Statuses", "Active", "Inactive"]} value={status} onChange={(value) => setStatus(value as StatusFilter)} />
          <div className="flex gap-3">
            <ExportButton data={exportData} filename="pricing-services" />
            <Button onClick={() => setFormDialog({ mode: "create" })} disabled={!allowed || !services.length}>
              <Plus className="h-4 w-4" />
              Add Pricing Item
            </Button>
          </div>
        </ToolbarCard>

        {!allowed ? (
          <div className="p-6"><EmptyState title="You don't have permission to view this page" description="Contact an administrator if you believe this is a mistake." /></div>
        ) : issuesQuery.isLoading || servicesQuery.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading pricing data...
          </div>
        ) : issuesQuery.isError ? (
          <div className="flex flex-col items-start gap-3 p-6 text-sm font-semibold text-red-600 sm:flex-row sm:items-center">
            <AlertTriangle className="h-4 w-4" />
            {getErrorMessage(issuesQuery.error, "Unable to load pricing data.")}
            <Button size="sm" variant="outline" onClick={() => void issuesQuery.refetch()}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={query || status !== "All Statuses" ? "No pricing items match the current filters." : "No pricing items yet"}
              description={
                query || status !== "All Statuses"
                  ? "Try a different search term or filter."
                  : services.length
                    ? "Add a pricing item to define price ranges for a service."
                    : "Add a service category first before defining pricing."
              }
            />
          </div>
        ) : (
          <AdminDataTable data={filtered} columns={columns} minWidth="1080px" rowLabel="pricing items" />
        )}
      </CardShell>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl">{toast}</div>
      )}

      {allowed && (
        <>
          <PricingFormDialog
            open={formDialog !== null}
            mode={formDialog?.mode ?? "create"}
            issue={formDialog?.issue}
            issues={issues}
            services={services}
            currency={currency}
            onOpenChange={(open) => !open && setFormDialog(null)}
            onSaved={(message) => setToast(message)}
            onError={(message) => setToast(message)}
          />
          <StatusChangeDialog
            open={statusDialogIssue !== undefined}
            issue={statusDialogIssue}
            services={services}
            onOpenChange={(open) => !open && setStatusDialogIssue(undefined)}
            onSaved={(message) => setToast(message)}
            onError={(message) => setToast(message)}
          />
        </>
      )}
    </div>
  );
}
