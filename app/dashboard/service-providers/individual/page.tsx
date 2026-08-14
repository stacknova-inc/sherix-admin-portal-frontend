"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Eye,
  Loader2,
  MapPin,
  MoreVertical,
  UserCheck,
  UserRound,
  UserRoundX,
  X,
} from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { AccountStateDialog } from "@/components/shared/AccountStateDialog";
import { RejectReasonDialog } from "@/components/shared/RejectReasonDialog";
import { DetailGrid } from "@/components/shared/DetailField";
import {
  FilterSelect,
  PersonCell,
  SearchBox,
  ServiceTags,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/api";
import { hasPermission, Permission } from "@/lib/rbac";
import { activeStatus, asRecord, firstText, recordId, text } from "@/lib/live-data";
import {
  useMechanicStatus,
  useMechanicVerification,
  useIndividualMechanics,
} from "@/hooks/useMechanics";
import { useUiStore } from "@/store/use-ui-store";
import type { Mechanic } from "@/types";

type Row = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  services: string[];
  location: string;
  verificationStatus: "Approved" | "Rejected";
  status: "Active" | "Suspended";
};
const values = (source: unknown) =>
  Array.isArray(source)
    ? source
        .map((item) =>
          typeof item === "string"
            ? item
            : String((item as { name?: string }).name ?? ""),
        )
        .filter(Boolean)
    : typeof source === "string"
      ? [source]
      : [];
const map = (item: Mechanic): Row => ({
  userId: item.userId ?? item.id ?? item._id ?? "",
  name: item.name ?? "Unnamed mechanic",
  email: item.email ?? "-",
  phone: item.phoneNumber ?? "-",
  company: item.company ?? item.businessName ?? "-",
  services: values(item.services),
  location: item.location ?? "-",
  verificationStatus:
    item.verificationStatus?.toLowerCase() === "rejected" ||
    item.isAccountApproved === false
      ? "Rejected"
      : "Approved",
  status:
    item.status?.toLowerCase() === "suspended" || item.isActive === false
      ? "Suspended"
      : "Active",
});

function MechanicDetailsDialog({ id, onOpenChange }: { id: string; onOpenChange: (open: boolean) => void }) {
  const query = useIndividualMechanics();
  const mechanic = (query.data ?? []).find(
    (item) => recordId(item) === id || String(asRecord(item).userId ?? "") === id,
  );
  const record = asRecord(mechanic);
  const photo = firstText(asRecord(record.profilePhoto).url ? asRecord(record.profilePhoto) : record, ["url", "profilePhotoUrl"], "");
  const name = firstText(record, ["name", "fullName"], "Mechanic details");
  const [photoFailed, setPhotoFailed] = React.useState(false);
  const fields: Array<[string, React.ReactNode]> = [
    ["Email", firstText(record, ["email"])],
    ["Phone", firstText(record, ["phone", "phoneNumber"])],
    ["Company", firstText(record, ["company", "businessName"])],
    ["Services", text(record.services)],
    ["Location", firstText(record, ["location", "address"])],
    ["Completed jobs", text(record.completedJobsCount ?? record.completedJobs, "0")],
  ];

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Mechanic profile and account details from the backend.</DialogDescription>
        </DialogHeader>
        {query.isLoading ? (
          <p className="text-sm font-semibold text-muted-foreground">Loading mechanic details...</p>
        ) : query.isError || !mechanic ? (
          <p className="text-sm font-semibold text-red-600">Unable to load mechanic details.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {photo && !photoFailed ? (
                <img src={photo} alt={`${name} profile`} className="h-20 w-20 rounded-full object-cover" onError={() => setPhotoFailed(true)} />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-muted">
                  <UserRound className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-lg font-black">{name}</p>
                <StatusCell status={activeStatus(record)} />
              </div>
            </div>
            <DetailGrid fields={fields} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Actions({
  row,
  notify,
  onView,
}: {
  row: Row;
  notify: (message: string) => void;
  onView: (id: string) => void;
}) {
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const allowed = hasPermission(role, Permission.SERVICES);
  const verification = useMechanicVerification();
  const status = useMechanicStatus();
  const [pending, setPending] = React.useState<"activate" | "suspend" | null>(
    null,
  );
  const [reason, setReason] = React.useState("");
  const [rejecting, setRejecting] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  async function approve() {
    try {
      await verification.mutateAsync({ userId: row.userId, action: "approve" });
      notify("Mechanic approved. An email notification will be sent to the mechanic.");
    } catch (error) {
      notify(getErrorMessage(error, "Unable to approve mechanic"));
    }
  }
  async function confirmReject() {
    try {
      await verification.mutateAsync({ userId: row.userId, action: "reject", reason: rejectReason });
      notify("Mechanic rejected. An email notification will be sent to the mechanic.");
      setRejecting(false);
      setRejectReason("");
    } catch (error) {
      notify(getErrorMessage(error, "Unable to reject mechanic"));
    }
  }
  async function confirm() {
    if (!pending) return;
    try {
      await status.mutateAsync({
        userId: row.userId,
        action: pending,
        reason: pending === "suspend" ? reason : undefined,
      });
      notify(`Mechanic ${pending === "activate" ? "activated" : "suspended"}. An email notification will be sent to the mechanic.`);
      setPending(null);
      setReason("");
    } catch (error) {
      notify(getErrorMessage(error, `Unable to ${pending} mechanic`));
    }
  }
  const isBusy = verification.isPending || status.isPending;
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${row.name}`}
            disabled={!allowed || isBusy}
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onSelect={() => setTimeout(() => onView(row.userId), 0)}>
            <Eye className="mr-2 h-4 w-4" />
            View mechanic
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => void approve()}
            disabled={row.verificationStatus === "Approved"}
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setTimeout(() => setRejecting(true), 0)}
            disabled={row.verificationStatus === "Rejected"}
            className="text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setTimeout(() => setPending("activate"), 0)}
            disabled={row.status === "Active"}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setTimeout(() => setPending("suspend"), 0)}
            disabled={row.status === "Suspended"}
          >
            <UserRoundX className="mr-2 h-4 w-4" />
            Suspend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {pending && (
        <AccountStateDialog
          open
          accountLabel="Mechanic"
          action={pending}
          reason={reason}
          onReasonChange={setReason}
          pending={status.isPending}
          onOpenChange={(open) => !open && setPending(null)}
          onConfirm={() => void confirm()}
        />
      )}
      {rejecting && (
        <RejectReasonDialog
          open
          accountLabel="Mechanic"
          reason={rejectReason}
          onReasonChange={setRejectReason}
          pending={verification.isPending}
          onOpenChange={(open) => !open && setRejecting(false)}
          onConfirm={() => void confirmReject()}
        />
      )}
    </>
  );
}
const columns = (notify: (message: string) => void, onView: (id: string) => void): ColumnDef<Row>[] => [
  { accessorKey: "userId", header: "Mechanic ID" },
  {
    accessorKey: "name",
    header: "Mechanic",
    cell: ({ row }) => (
      <PersonCell
        name={row.original.name}
        sub={row.original.email}
        initials={row.original.name.slice(0, 2)}
        avatarTone="bg-blue-600 text-white"
      />
    ),
  },
  { accessorKey: "company", header: "Company" },
  {
    accessorKey: "services",
    header: "Services",
    cell: ({ row }) => <ServiceTags services={row.original.services} />,
  },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="flex gap-2">
        <MapPin className="h-4 w-4" />
        {row.original.location}
      </span>
    ),
  },
  {
    accessorKey: "verificationStatus",
    header: "Verification Status",
    cell: ({ row }) => <StatusCell status={row.original.verificationStatus} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <Actions row={row.original} notify={notify} onView={onView} />,
  },
];

export default function IndividualMechanicsPage() {
  const query = useIndividualMechanics();
  const [toast, setToast] = React.useState("");
  const [viewingId, setViewingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("Status");
  const [verification, setVerification] = React.useState("Verification");
  const rows = React.useMemo(() => (query.data ?? []).map(map), [query.data]);
  const filtered = rows.filter(
    (row) =>
      (!search ||
        [row.name, row.email, row.phone, row.company, ...row.services]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (status === "Status" || row.status === status) &&
      (verification === "Verification" || row.verificationStatus === verification),
  );
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Individual Mechanics"
        subtitle="Manage individual mechanic verification and account status."
      />
      <CardShell>
        <ToolbarCard>
          <SearchBox
            placeholder="Search mechanics by name, email, phone or company..."
            value={search}
            onChange={setSearch}
          />
          <FilterSelect
            placeholder="Status"
            values={["Status", "Active", "Suspended"]}
            value={status}
            onChange={setStatus}
          />
          <FilterSelect
            placeholder="Verification"
            values={["Verification", "Approved", "Rejected"]}
            value={verification}
            onChange={setVerification}
          />
        </ToolbarCard>
        {query.isLoading ? (
          <div className="flex gap-2 p-6 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading mechanics...
          </div>
        ) : query.isError ? (
          <div className="flex gap-3 p-6 text-red-600">
            Unable to load mechanics.
            <Button
              size="sm"
              variant="outline"
              onClick={() => void query.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            {search || status !== "Status" || verification !== "Verification"
              ? "No mechanics match the current filters."
              : "No individual mechanics found."}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            columns={columns(setToast, setViewingId)}
            minWidth="1320px"
            rowLabel="mechanics"
          />
        )}
      </CardShell>
      {toast && (
        <div className="fixed bottom-5 right-5 rounded-xl border bg-card p-4 text-sm font-bold">
          {toast}
        </div>
      )}
      {viewingId && (
        <MechanicDetailsDialog id={viewingId} onOpenChange={(open) => !open && setViewingId(null)} />
      )}
    </div>
  );
}
