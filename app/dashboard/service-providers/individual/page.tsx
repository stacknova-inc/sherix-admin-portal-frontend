"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Loader2,
  MapPin,
  MoreVertical,
  UserCheck,
  UserRound,
  UserRoundX,
} from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { AccountStateDialog } from "@/components/shared/AccountStateDialog";
import { RejectReasonDialog } from "@/components/shared/RejectReasonDialog";
import { ProviderDetailRow, ProviderDetailSection } from "@/components/shared/ProviderDetails";
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
import { asRecord, firstText, getKycStatus, getProviderStatus, recordId, text, type ProviderStatus } from "@/lib/live-data";
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
  status: ProviderStatus;
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
  status: getProviderStatus(item),
});

function MechanicDetailsDialog({ id, onOpenChange, notify }: { id: string; onOpenChange: (open: boolean) => void; notify: (message: string) => void }) {
  const query = useIndividualMechanics();
  const verification = useMechanicVerification();
  const [rejecting, setRejecting] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const mechanic = (query.data ?? []).find(
    (item) => recordId(item) === id || String(asRecord(item).userId ?? "") === id,
  );
  const record = asRecord(mechanic);
  const photo = firstText(asRecord(record.profilePhoto).url ? asRecord(record.profilePhoto) : record, ["url", "profilePhotoUrl"], "");
  const name = firstText(record, ["name", "fullName"], "Mechanic details");
  const status: ProviderStatus = mechanic ? getProviderStatus(mechanic) : "Pending";
  const kycStatus = mechanic ? getKycStatus(mechanic) : "Pending";
  const [photoFailed, setPhotoFailed] = React.useState(false);

  async function approve() {
    try {
      await verification.mutateAsync({ userId: id, action: "approve" });
      notify("Mechanic approved successfully. An email notification will be sent to the mechanic.");
    } catch (error) {
      notify(getErrorMessage(error, "Unable to approve mechanic"));
    }
  }

  async function confirmReject() {
    try {
      await verification.mutateAsync({ userId: id, action: "reject", reason: rejectReason });
      notify("Mechanic rejected successfully. An email notification will be sent to the mechanic.");
      setRejecting(false);
      setRejectReason("");
    } catch (error) {
      notify(getErrorMessage(error, "Unable to reject mechanic"));
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Mechanic profile and account details from the backend.</DialogDescription>
        </DialogHeader>
        {query.isLoading ? (
          <p className="text-sm font-semibold text-muted-foreground">Loading mechanic details...</p>
        ) : query.isError || !mechanic ? (
          <p className="text-sm font-semibold text-red-600">Unable to load mechanic details.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-4">
                {photo && !photoFailed ? (
                  <img src={photo} alt={`${name} profile`} className="h-14 w-14 rounded-full object-cover" onError={() => setPhotoFailed(true)} />
                ) : (
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-muted">
                    <UserRound className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-black">{name}</p>
                  <p className="text-xs text-muted-foreground">Individual mechanic</p>
                </div>
              </div>
              <StatusCell status={status} />
            </div>

            <ProviderDetailSection title="Provider overview">
              <ProviderDetailRow label="Email" value={firstText(record, ["email"])} />
              <ProviderDetailRow label="Phone" value={firstText(record, ["phone", "phoneNumber"])} />
              <ProviderDetailRow label="Provider type" value="Mechanic" />
              <ProviderDetailRow label="Account status" value={status} />
              <ProviderDetailRow label="KYC status" value={kycStatus} />
            </ProviderDetailSection>

            <ProviderDetailSection title="Business information">
              <ProviderDetailRow label="Company" value={firstText(record, ["company", "businessName"])} />
              <ProviderDetailRow label="Location" value={firstText(record, ["location", "address"])} />
              <ProviderDetailRow label="Services" value={text(record.services)} />
            </ProviderDetailSection>

            <ProviderDetailSection title="Activity">
              <ProviderDetailRow label="Completed requests" value={text(record.completedJobsCount ?? record.completedJobs, "0")} />
            </ProviderDetailSection>

            <div className="flex justify-end gap-2 border-t pt-4">
              {kycStatus !== "Rejected" && (
                <Button variant="outline" className="text-red-600 hover:text-red-600" onClick={() => setRejecting(true)} disabled={verification.isPending}>
                  Reject
                </Button>
              )}
              {kycStatus !== "Approved" && (
                <Button onClick={() => void approve()} disabled={verification.isPending}>
                  {verification.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
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
  const status = useMechanicStatus();
  const [pending, setPending] = React.useState<"activate" | "suspend" | null>(
    null,
  );
  const [reason, setReason] = React.useState("");
  async function confirm() {
    if (!pending) return;
    try {
      await status.mutateAsync({
        userId: row.userId,
        action: pending,
        reason: pending === "suspend" ? reason : undefined,
      });
      notify(`Mechanic ${pending === "activate" ? "activated" : "suspended"} successfully.`);
      setPending(null);
      setReason("");
    } catch (error) {
      notify(getErrorMessage(error, `Unable to ${pending} mechanic`));
    }
  }
  const isBusy = status.isPending;
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
          {row.status === "Active" ? (
            <DropdownMenuItem onSelect={() => setTimeout(() => setPending("suspend"), 0)}>
              <UserRoundX className="mr-2 h-4 w-4" />
              Suspend
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => setTimeout(() => setPending("activate"), 0)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Activate
            </DropdownMenuItem>
          )}
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
    </>
  );
}
const columns = (notify: (message: string) => void, onView: (id: string) => void): ColumnDef<Row>[] => [
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
  const rows = React.useMemo(() => (query.data ?? []).map(map), [query.data]);
  const filtered = rows.filter(
    (row) =>
      (!search ||
        [row.name, row.email, row.phone, row.company, ...row.services]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (status === "Status" || row.status === status),
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
            values={["Status", "Pending", "Active", "Suspended"]}
            value={status}
            onChange={setStatus}
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
            {search || status !== "Status"
              ? "No mechanics match the current filters."
              : "No individual mechanics found."}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            columns={columns(setToast, setViewingId)}
            minWidth="1240px"
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
        <MechanicDetailsDialog id={viewingId} onOpenChange={(open) => !open && setViewingId(null)} notify={setToast} />
      )}
    </div>
  );
}
