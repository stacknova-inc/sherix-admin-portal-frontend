"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Edit,
  Eye,
  KeyRound,
  Loader2,
  MoreVertical,
  Plus,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { MetricGrid, PaginationFooter, PersonCell, SoftTag, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  useCreateStaff,
  useDeleteStaff,
  useResetStaffPassword,
  useStaffAuditLogs,
  useStaffMembers,
  useStaffStatusAction,
  useUpdateStaff,
} from "@/hooks/useStaff";
import { staffRoleDefinitions, type StaffStatusAction } from "@/services/staff";
import type { CreateStaffInput, StaffMember, StaffStatus, UpdateStaffInput } from "@/types";

type StaffFormMode = "create" | "edit";
type StaffSortKey = "fullName" | "createdAt" | "lastLogin";

const statuses: Array<"All Statuses" | StaffStatus> = ["All Statuses", "Active", "Suspended", "Inactive", "Pending Invitation"];
const departments = staffRoleDefinitions.map((definition) => definition.department);
const roleLabels = new Map(staffRoleDefinitions.map((definition) => [definition.role, definition.label]));

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function dateTime(value?: string) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function dateOnly(value?: string) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function rolesForDepartment(department: string) {
  return staffRoleDefinitions.filter((definition) => definition.department === department);
}

function defaultRole(department: string) {
  return rolesForDepartment(department)[0]?.role ?? staffRoleDefinitions[0].role;
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl">{message}</div>;
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative min-w-0 flex-1">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-card pl-3"
        placeholder="Search by name, email or phone..."
      />
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  description,
  actionLabel,
  destructive,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  actionLabel: string;
  destructive?: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-base font-black">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">{description}</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {actionLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function StaffFormModal({
  open,
  mode,
  staff,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  mode: StaffFormMode;
  staff?: StaffMember;
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
}) {
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const firstDepartment = departments[0];
  const [form, setForm] = React.useState<CreateStaffInput>({
    fullName: "",
    email: "",
    phoneNumber: "",
    department: firstDepartment,
    role: defaultRole(firstDepartment),
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = React.useState("");
  const isEdit = mode === "edit";
  const pending = createStaff.isPending || updateStaff.isPending;
  const availableRoles = rolesForDepartment(form.department);

  React.useEffect(() => {
    if (!open) return;
    setError("");
    if (isEdit && staff) {
      setForm({
        fullName: staff.fullName,
        email: staff.email,
        phoneNumber: staff.phoneNumber,
        department: staff.department,
        role: staff.role,
        password: "",
        confirmPassword: "",
      });
      return;
    }
    setForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      department: firstDepartment,
      role: defaultRole(firstDepartment),
      password: "",
      confirmPassword: "",
    });
  }, [firstDepartment, isEdit, open, staff]);

  function setField<Key extends keyof CreateStaffInput>(key: Key, value: CreateStaffInput[Key]) {
    setForm((current) => {
      if (key === "department") {
        return { ...current, department: value, role: defaultRole(String(value)) };
      }
      return { ...current, [key]: value };
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      if (isEdit && staff) {
        const input: UpdateStaffInput = {
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          department: form.department,
          role: form.role,
        };
        await updateStaff.mutateAsync({ id: staff.id ?? staff._id ?? "", input });
        onSaved("Staff member updated successfully.");
      } else {
        await createStaff.mutateAsync(form);
        onSaved("Staff invitation created and notification sent.");
      }
      onOpenChange(false);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to save staff member."));
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border bg-background shadow-2xl">
          <form onSubmit={submit} className="flex max-h-[92vh] flex-col">
            <div className="border-b p-5 pr-12">
              <DialogPrimitive.Title className="text-lg font-black">{isEdit ? "Edit Staff" : "Add Staff"}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                Department selection controls the available staff role.
              </DialogPrimitive.Description>
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
            <div className="grid gap-4 overflow-y-auto p-5">
              <label className="grid gap-1.5 text-xs font-bold">
                Full Name
                <Input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} required />
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Email Address
                <Input value={form.email} onChange={(event) => setField("email", event.target.value)} type="email" required disabled={isEdit} />
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Phone Number
                <Input value={form.phoneNumber} onChange={(event) => setField("phoneNumber", event.target.value)} required />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-bold">
                  Department
                  <Select value={form.department} onValueChange={(value) => setField("department", value)}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="grid gap-1.5 text-xs font-bold">
                  Role
                  <Select value={form.role} onValueChange={(value) => setField("role", value)}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {availableRoles.map((definition) => (
                        <SelectItem key={definition.role} value={definition.role}>
                          {definition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>
              {!isEdit && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-bold">
                    Password
                    <Input value={form.password} onChange={(event) => setField("password", event.target.value)} type="password" required minLength={8} />
                  </label>
                  <label className="grid gap-1.5 text-xs font-bold">
                    Confirm Password
                    <Input value={form.confirmPassword} onChange={(event) => setField("confirmPassword", event.target.value)} type="password" required minLength={8} />
                  </label>
                </div>
              )}
              {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t bg-background p-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Create Staff"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function StaffActions({
  staff,
  onEdit,
  onToast,
}: {
  staff: StaffMember;
  onEdit: (staff: StaffMember) => void;
  onToast: (message: string) => void;
}) {
  const statusAction = useStaffStatusAction();
  const resetPassword = useResetStaffPassword();
  const deleteStaff = useDeleteStaff();
  const [confirm, setConfirm] = React.useState<null | { title: string; description: string; actionLabel: string; destructive?: boolean; run: () => Promise<void> }>(null);
  const id = staff.id ?? staff._id ?? "";
  const pending = statusAction.isPending || resetPassword.isPending || deleteStaff.isPending;

  function confirmStatus(action: StaffStatusAction, label: string) {
    setConfirm({
      title: `${label} staff account`,
      description: `${staff.fullName}'s account access will be changed to ${label.toLowerCase()}.`,
      actionLabel: label,
      destructive: action !== "activate",
      run: async () => {
        await statusAction.mutateAsync({ id, action });
        onToast(`${staff.fullName} has been ${label.toLowerCase()}d.`);
      },
    });
  }

  function confirmReset() {
    setConfirm({
      title: "Reset staff password",
      description: `A password reset link will be generated and logged for ${staff.email}.`,
      actionLabel: "Send Reset",
      run: async () => {
        await resetPassword.mutateAsync(id);
        onToast("Password reset link generated and notification recorded.");
      },
    });
  }

  function confirmDelete() {
    setConfirm({
      title: "Delete staff account",
      description: `${staff.fullName} will be soft deleted and removed from active staff lists.`,
      actionLabel: "Delete Staff",
      destructive: true,
      run: async () => {
        await deleteStaff.mutateAsync(id);
        onToast(`${staff.fullName} was soft deleted.`);
      },
    });
  }

  async function runConfirmed() {
    if (!confirm) return;
    try {
      await confirm.run();
      setConfirm(null);
    } catch (error) {
      onToast(getErrorMessage(error, "Action failed."));
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${staff.fullName}`}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/staff-management/${id}`}>
              <Eye className="h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(staff)}>
            <Edit className="h-4 w-4" />
            Edit Staff
          </DropdownMenuItem>
          <DropdownMenuItem onClick={confirmReset}>
            <KeyRound className="h-4 w-4" />
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => confirmStatus("suspend", "Suspend")}>
            <ShieldAlert className="h-4 w-4" />
            Suspend Staff
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => confirmStatus("activate", "Activate")}>
            <CheckCircle2 className="h-4 w-4" />
            Activate Staff
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => confirmStatus("deactivate", "Deactivate")}>
            <UserRoundX className="h-4 w-4" />
            Deactivate Staff
          </DropdownMenuItem>
          <DropdownMenuItem onClick={confirmDelete} className="text-red-600">
            <Trash2 className="h-4 w-4" />
            Delete Staff
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        actionLabel={confirm?.actionLabel ?? "Confirm"}
        destructive={confirm?.destructive}
        pending={pending}
        onOpenChange={(open) => !open && setConfirm(null)}
        onConfirm={runConfirmed}
      />
    </>
  );
}

function buildColumns(onEdit: (staff: StaffMember) => void, onToast: (message: string) => void): ColumnDef<StaffMember>[] {
  return [
    { id: "index", header: "#", cell: ({ row }) => <span className="font-black">{row.index + 1}</span> },
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: ({ row }) => <PersonCell name={row.original.fullName} sub={row.original.email} initials={initials(row.original.fullName)} avatarTone="bg-slate-900 text-white" />,
    },
    { accessorKey: "email", header: "Email Address" },
    { accessorKey: "phoneNumber", header: "Phone Number" },
    { accessorKey: "department", header: "Department", cell: ({ row }) => <SoftTag tone="blue">{row.original.department}</SoftTag> },
    { accessorKey: "role", header: "Role", cell: ({ row }) => <span className="font-bold">{roleLabels.get(row.original.role) ?? row.original.role}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Date Created", cell: ({ row }) => dateOnly(row.original.createdAt) },
    { accessorKey: "lastLogin", header: "Last Login", cell: ({ row }) => dateTime(row.original.lastLogin) },
    { id: "actions", header: "Actions", cell: ({ row }) => <StaffActions staff={row.original} onEdit={onEdit} onToast={onToast} /> },
  ];
}

export function StaffManagementPage() {
  const staffQuery = useStaffMembers();
  const auditQuery = useStaffAuditLogs();
  const [toast, setToast] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [department, setDepartment] = React.useState("All Departments");
  const [role, setRole] = React.useState("All Roles");
  const [status, setStatus] = React.useState<(typeof statuses)[number]>("All Statuses");
  const [sortBy, setSortBy] = React.useState<StaffSortKey>("createdAt");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | undefined>();
  const staff = staffQuery.data ?? [];
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return staff
      .filter((member) => {
        const matchesSearch = !search || [member.fullName, member.email, member.phoneNumber].some((value) => value.toLowerCase().includes(search));
        const matchesDepartment = department === "All Departments" || member.department === department;
        const matchesRole = role === "All Roles" || member.role === role;
        const matchesStatus = status === "All Statuses" || member.status === status;
        return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
      })
      .sort((left, right) => {
        if (sortBy === "fullName") return left.fullName.localeCompare(right.fullName);
        const leftTime = new Date(left[sortBy] ?? 0).getTime();
        const rightTime = new Date(right[sortBy] ?? 0).getTime();
        return rightTime - leftTime;
      });
  }, [department, query, role, sortBy, staff, status]);
  const metrics = React.useMemo(
    () => [
      { label: "Total Staff", value: String(staff.length), change: "Internal admins", direction: "up", tone: "blue", icon: UsersRound },
      { label: "Active", value: String(staff.filter((member) => member.status === "Active").length), change: "Can access portal", direction: "up", tone: "green", icon: UserCheck },
      { label: "Suspended", value: String(staff.filter((member) => member.status === "Suspended").length), change: "Access disabled", direction: "down", tone: "red", icon: ShieldAlert },
      { label: "Pending", value: String(staff.filter((member) => member.status === "Pending Invitation").length), change: "Awaiting setup", direction: "up", tone: "amber", icon: KeyRound },
      { label: "Audit Events", value: String(auditQuery.data?.length ?? 0), change: "Tracked actions", direction: "up", tone: "teal", icon: CheckCircle2 },
    ],
    [auditQuery.data?.length, staff],
  );

  function openCreate() {
    setEditingStaff(undefined);
    setSheetOpen(true);
  }

  function openEdit(staffMember: StaffMember) {
    setEditingStaff(staffMember);
    setSheetOpen(true);
  }

  const columns = React.useMemo(() => buildColumns(openEdit, setToast), []);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Staff Management" subtitle="Manage Sherix internal staff accounts, roles, status changes, and audit activity." />
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <MetricGrid metrics={metrics} />

      <CardShell>
        <ToolbarCard>
          <SearchField value={query} onChange={setQuery} />
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="h-9 w-full bg-card lg:w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {["All Departments", ...departments].map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-9 w-full bg-card lg:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {["All Roles", ...staffRoleDefinitions.map((definition) => definition.role)].map((value) => (
                <SelectItem key={value} value={value}>
                  {roleLabels.get(value) ?? value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => setStatus(value as (typeof statuses)[number])}>
            <SelectTrigger className="h-9 w-full bg-card lg:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {statuses.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as StaffSortKey)}>
            <SelectTrigger className="h-9 w-full bg-card lg:w-[155px]">
              <ChevronDown className="hidden h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="fullName">Name</SelectItem>
              <SelectItem value="lastLogin">Last Login</SelectItem>
            </SelectContent>
          </Select>
        </ToolbarCard>
        {staffQuery.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading staff members...
          </div>
        ) : staffQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-red-600">Unable to load staff members.</div>
        ) : (
          <AdminDataTable data={filteredRows} columns={columns} minWidth="1320px" />
        )}
        <PaginationFooter label={`Showing ${filteredRows.length ? `1 to ${filteredRows.length}` : "0"} of ${filteredRows.length} staff members`} pageCount={String(Math.max(1, Math.ceil(filteredRows.length / 10)))} />
      </CardShell>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <CardShell className="p-4">
          <h2 className="text-sm font-black">Department Role Mapping</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {staffRoleDefinitions.map((definition) => (
              <div key={definition.role} className={cn("rounded-xl border bg-card p-3", definition.department === department && "border-primary")}>
                <p className="text-xs font-black">{definition.label}</p>
                <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{definition.department}</p>
                <p className="mt-2 text-xs text-muted-foreground">{definition.role}</p>
              </div>
            ))}
          </div>
        </CardShell>
        <CardShell className="p-4">
          <h2 className="text-sm font-black">Recent Audit Events</h2>
          <div className="mt-3 grid gap-2">
            {(auditQuery.data ?? []).slice(0, 4).map((event) => (
              <div key={event.id} className="rounded-xl border bg-card p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black">{event.actionType}</p>
                  <span className="text-muted-foreground">{dateTime(event.timestamp)}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{event.note}</p>
              </div>
            ))}
          </div>
        </CardShell>
      </div>

      <StaffFormModal
        open={sheetOpen}
        mode={editingStaff ? "edit" : "create"}
        staff={editingStaff}
        onOpenChange={setSheetOpen}
        onSaved={setToast}
      />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
