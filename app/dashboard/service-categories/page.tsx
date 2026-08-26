"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, FolderTree, History, Loader2, MoreVertical, Pencil, Plus, Power, PowerOff, Tags } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { ExportButton, FilterSelect, MetricGrid, SearchBox, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getErrorMessage, isApiConflict } from "@/lib/api";
import { asRecord, dateText, recordId, text } from "@/lib/live-data";
import { hasPermission, Permission } from "@/lib/rbac";
import { useUiStore } from "@/store/use-ui-store";
import { useAddService, useServices, useUpdateService } from "@/hooks/useServices";
import type { Service } from "@/types";

type StatusFilter = "All Statuses" | "Active" | "Inactive";

function isServiceActive(service: Service) {
  const record = asRecord(service);
  if (typeof record.isActive === "boolean") return record.isActive;
  if (typeof record.status === "string") return record.status.toLowerCase() === "active";
  return true;
}

function serviceStatusLabel(service: Service) {
  return isServiceActive(service) ? "Active" : "Inactive";
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

function CategoryFormDialog({
  open,
  mode,
  category,
  services,
  onOpenChange,
  onSaved,
  onError,
}: {
  open: boolean;
  mode: "create" | "edit";
  category?: Service;
  services: Service[];
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const addService = useAddService();
  const updateService = useUpdateService();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setName(text(category?.name ?? category?.title, ""));
    setDescription(text(category?.description, ""));
    setIcon(text(category?.icon, ""));
  }, [open, category]);

  const trimmedName = name.trim();
  const categoryId = category ? recordId(category) : "";
  const nameError =
    trimmedName.length > 0 && trimmedName.length < 4
      ? "Use at least 4 characters."
      : services.some((service) => recordId(service) !== categoryId && text(service.name ?? service.title, "").trim().toLowerCase() === trimmedName.toLowerCase())
        ? "A category with this name already exists."
        : undefined;
  const descriptionError = description.length > 200 ? "Description must be 200 characters or fewer." : undefined;
  const isPending = addService.isPending || updateService.isPending;
  const canSubmit = Boolean(trimmedName) && Boolean(description.trim()) && !nameError && !descriptionError && !isPending;

  async function submit() {
    if (!canSubmit) return;
    try {
      if (mode === "create") {
        await addService.mutateAsync({ name: trimmedName, description: description.trim(), icon: icon.trim() });
        onSaved("Service category created successfully.");
      } else {
        await updateService.mutateAsync({ id: categoryId, payload: { name: trimmedName, description: description.trim(), icon: icon.trim() } });
        onSaved("Service category updated successfully.");
      }
      onOpenChange(false);
    } catch (error) {
      if (isApiConflict(error)) {
        onError("This category was changed by another administrator. Refresh the list and try again.");
        return;
      }
      onError(getErrorMessage(error, mode === "create" ? "Unable to create category." : "Unable to update category."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Service Category" : "Edit Service Category"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Create a new category that services can be organized under." : "Update the details for this service category."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField label="Category Name" error={nameError} hint={!nameError ? `${name.length}/80 characters` : undefined}>
            <Input value={name} onChange={(event) => setName(event.target.value.slice(0, 80))} placeholder="Roadside Assistance" />
          </FormField>
          <FormField label="Description" error={descriptionError} hint={!descriptionError ? `${description.length}/200 characters` : undefined}>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, 200))}
              className="min-h-24 rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              placeholder="Describe what this category covers..."
            />
          </FormField>
          <FormField label="Icon" hint="Optional icon name or URL from the backend-supported icon set.">
            <Input value={icon} onChange={(event) => setIcon(event.target.value)} placeholder="wrench" />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Save Category" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusChangeDialog({
  open,
  category,
  onOpenChange,
  onSaved,
  onError,
}: {
  open: boolean;
  category?: Service;
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const updateService = useUpdateService();
  if (!category) return null;
  const currentlyActive = isServiceActive(category);
  const categoryId = recordId(category);
  const name = text(category.name ?? category.title, "This category");

  async function confirm() {
    try {
      await updateService.mutateAsync({ id: categoryId, payload: { isActive: !currentlyActive } });
      onSaved(`${name} was ${currentlyActive ? "deactivated" : "activated"} successfully.`);
      onOpenChange(false);
    } catch (error) {
      if (isApiConflict(error)) {
        onError("This category's status was changed by another administrator. Refresh the list and try again.");
        return;
      }
      onError(getErrorMessage(error, "Unable to update category status."));
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
                Current status: <span className="font-bold text-foreground">{currentlyActive ? "Active" : "Inactive"}</span> — new status:{" "}
                <span className="font-bold text-foreground">{currentlyActive ? "Inactive" : "Active"}</span>.
              </p>
              {currentlyActive ? (
                <p>
                  Deactivating hides this category from being selected for new services and pricing items. Services and pricing already assigned to it are
                  not deleted or changed.
                </p>
              ) : (
                <p>Activating makes this category selectable again for new services and pricing items.</p>
              )}
              <p>This action can be reversed at any time by toggling the status again.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateService.isPending}>Cancel</Button>
          <Button variant={currentlyActive ? "destructive" : "default"} onClick={() => void confirm()} disabled={updateService.isPending}>
            {updateService.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {currentlyActive ? "Deactivate" : "Activate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CategoryActions({
  category,
  allowed,
  onEdit,
  onToggleStatus,
}: {
  category: Service;
  allowed: boolean;
  onEdit: (category: Service) => void;
  onToggleStatus: (category: Service) => void;
}) {
  const active = isServiceActive(category);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${text(category.name ?? category.title, "category")}`} disabled={!allowed}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(category)}>
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onToggleStatus(category)} className={active ? "text-red-600 focus:text-red-600" : undefined}>
          {active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          {active ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ServiceCategoriesPage() {
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const allowed = hasPermission(role, Permission.SERVICES);
  const servicesQuery = useServices();
  const services = servicesQuery.data ?? [];
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("All Statuses");
  const [toast, setToast] = React.useState("");
  const [formDialog, setFormDialog] = React.useState<{ mode: "create" | "edit"; category?: Service } | null>(null);
  const [statusDialogCategory, setStatusDialogCategory] = React.useState<Service | undefined>();

  const filtered = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return services.filter((service) => {
      const label = serviceStatusLabel(service);
      const haystack = [service.name, service.title, service.description, label].join(" ").toLowerCase();
      const matchesStatus = status === "All Statuses" || label === status;
      return (!search || haystack.includes(search)) && matchesStatus;
    });
  }, [query, services, status]);

  const metrics = React.useMemo(() => {
    const activeCount = services.filter(isServiceActive).length;
    return [
      { label: "Total Categories", value: String(services.length) },
      { label: "Active", value: String(activeCount) },
      { label: "Inactive", value: String(services.length - activeCount) },
    ];
  }, [services]);

  const exportData = React.useMemo(
    () =>
      filtered.map((service) => ({
        name: text(service.name ?? service.title, "-"),
        description: text(service.description, "-"),
        status: serviceStatusLabel(service),
        createdAt: dateText(service.createdAt),
      })),
    [filtered],
  );

  const columns: ColumnDef<Service>[] = [
    {
      id: "name",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex min-w-[200px] items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Tags className="h-4 w-4" />
          </span>
          <span className="font-black">{text(row.original.name ?? row.original.title, "Untitled category")}</span>
        </div>
      ),
    },
    { id: "description", header: "Description", cell: ({ row }) => <span className="inline-block max-w-md text-muted-foreground">{text(row.original.description, "-")}</span> },
    { id: "createdAt", header: "Created Date", cell: ({ row }) => <span className="font-semibold">{dateText(row.original.createdAt)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <StatusCell status={serviceStatusLabel(row.original)} /> },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <CategoryActions
          category={row.original}
          allowed={allowed}
          onEdit={(category) => setFormDialog({ mode: "edit", category })}
          onToggleStatus={setStatusDialogCategory}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Service Categories" subtitle="Create and manage the categories services are organized under across the marketplace." />
        <Button variant="outline" className="bg-card" asChild>
          <Link href="/dashboard/audit-logs">
            <History className="h-4 w-4" />
            View Audit History
          </Link>
        </Button>
      </div>

      <MetricGrid
        metrics={metrics.map((metric) => ({ ...metric, change: "Live backend data", direction: "up", tone: "blue", icon: FolderTree }))}
        columns="xl:grid-cols-3"
      />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search categories by name or description..." value={query} onChange={setQuery} />
          <FilterSelect placeholder="All Statuses" values={["All Statuses", "Active", "Inactive"]} value={status} onChange={(value) => setStatus(value as StatusFilter)} />
          <div className="flex gap-3">
            <ExportButton data={exportData} filename="service-categories" />
            <Button onClick={() => setFormDialog({ mode: "create" })} disabled={!allowed}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </ToolbarCard>

        {!allowed ? (
          <div className="p-6"><EmptyState title="You don't have permission to view this page" description="Contact an administrator if you believe this is a mistake." /></div>
        ) : servicesQuery.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading service categories...
          </div>
        ) : servicesQuery.isError ? (
          <div className="flex flex-col items-start gap-3 p-6 text-sm font-semibold text-red-600 sm:flex-row sm:items-center">
            <AlertTriangle className="h-4 w-4" />
            {getErrorMessage(servicesQuery.error, "Unable to load service categories.")}
            <Button size="sm" variant="outline" onClick={() => void servicesQuery.refetch()}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={query || status !== "All Statuses" ? "No categories match the current filters." : "No service categories yet"}
              description={query || status !== "All Statuses" ? "Try a different search term or filter." : "Add your first category to start organizing services."}
            />
          </div>
        ) : (
          <AdminDataTable data={filtered} columns={columns} minWidth="1000px" rowLabel="categories" />
        )}
      </CardShell>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl">{toast}</div>
      )}

      {allowed && (
        <>
          <CategoryFormDialog
            open={formDialog !== null}
            mode={formDialog?.mode ?? "create"}
            category={formDialog?.category}
            services={services}
            onOpenChange={(open) => !open && setFormDialog(null)}
            onSaved={(message) => setToast(message)}
            onError={(message) => setToast(message)}
          />
          <StatusChangeDialog
            open={statusDialogCategory !== undefined}
            category={statusDialogCategory}
            onOpenChange={(open) => !open && setStatusDialogCategory(undefined)}
            onSaved={(message) => setToast(message)}
            onError={(message) => setToast(message)}
          />
        </>
      )}
    </div>
  );
}
