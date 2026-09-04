"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Eye, Loader2, MapPin, MoreVertical, UserCheck, UserRoundX } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { AccountStateDialog } from "@/components/shared/AccountStateDialog";
import { RejectReasonDialog } from "@/components/shared/RejectReasonDialog";
import { ProviderDetailEmpty, ProviderDetailRow, ProviderDetailSection } from "@/components/shared/ProviderDetails";
import { FilterSelect, PersonCell, SearchBox, ServiceTags, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { describeMutationError } from "@/lib/api";
import { hasPermission, Permission } from "@/lib/rbac";
import { asRecord, firstText, getKycStatus, getProviderStatus, recordId, text, type ProviderStatus } from "@/lib/live-data";
import { useIdempotencyKey } from "@/hooks/useIdempotencyKey";
import { useCompanies, useCompanyStatus, useCompanyVerification } from "@/hooks/useCompanies";
import { useUiStore } from "@/store/use-ui-store";
import type { Company } from "@/types";

type Row = { companyId: string; name: string; email: string; phone: string; services: string[]; location: string; status: ProviderStatus };
const services = (source: unknown) => Array.isArray(source) ? source.map((item) => typeof item === "string" ? item : String((item as { name?: string }).name ?? "")).filter(Boolean) : [];
const map = (company: Company): Row => ({ companyId: company.companyId ?? company.id ?? company._id ?? "", name: company.name ?? company.companyName ?? "Unnamed company", email: company.email ?? "-", phone: company.phone ?? "-", services: services(company.services), location: company.coverageArea ?? company.location ?? company.address ?? "-", status: getProviderStatus(company) });

function contactText(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not available";
  if (typeof value === "string") return value;
  const record = asRecord(value);
  const parts = [firstText(record, ["name"], ""), firstText(record, ["phone"], ""), firstText(record, ["email"], "")].filter(
    (part) => part && part !== "-",
  );
  return parts.length ? parts.join(" · ") : "Not available";
}

function evidenceList(...sources: unknown[]) {
  return sources
    .flatMap((source) => (Array.isArray(source) ? source : []))
    .map((item) => asRecord(item))
    .filter((item) => typeof item.url === "string" && item.url);
}

function CompanyDetailsDialog({ id, onOpenChange, notify }: { id: string; onOpenChange: (open: boolean) => void; notify: (message: string) => void }) {
  const query = useCompanies();
  const verification = useCompanyVerification();
  const verificationIdempotencyKey = useIdempotencyKey(id);
  const [rejecting, setRejecting] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const company = (query.data ?? []).find(
    (item) => recordId(item) === id || String(asRecord(item).companyId ?? "") === id,
  );
  const record = asRecord(company);
  const name = firstText(record, ["name", "companyName", "businessName"], "Company details");
  const status: ProviderStatus = company ? getProviderStatus(company) : "Pending";
  const kycStatus = company ? getKycStatus(company) : "Pending";
  const evidence = evidenceList(record.identityEvidence, record.businessEvidence);
  const membership = asRecord(record.membership);
  const hasMembership = Object.values(membership).some((value) => value !== undefined && value !== null && value !== "");

  async function approve() {
    try {
      await verification.mutateAsync({ companyId: id, action: "approve", idempotencyKey: verificationIdempotencyKey });
      notify("Company approved successfully. An email notification will be sent to the company.");
    } catch (error) {
      notify(describeMutationError(error, "Approving this company"));
    }
  }

  async function confirmReject() {
    try {
      await verification.mutateAsync({ companyId: id, action: "reject", reason: rejectReason, idempotencyKey: verificationIdempotencyKey });
      notify("Company rejected successfully. An email notification will be sent to the company.");
      setRejecting(false);
      setRejectReason("");
    } catch (error) {
      notify(describeMutationError(error, "Rejecting this company"));
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Company profile and account details from the backend.</DialogDescription>
        </DialogHeader>
        {query.isLoading ? (
          <p className="text-sm font-semibold text-muted-foreground">Loading company details...</p>
        ) : query.isError || !company ? (
          <p className="text-sm font-semibold text-red-600">Unable to load company details.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-muted">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-black">{name}</p>
                  <p className="text-xs text-muted-foreground">Company provider</p>
                </div>
              </div>
              <StatusCell status={status} />
            </div>

            <ProviderDetailSection title="Provider overview">
              <ProviderDetailRow label="Email" value={firstText(record, ["email"])} />
              <ProviderDetailRow label="Phone" value={firstText(record, ["phone"])} />
              <ProviderDetailRow label="Provider type" value="Company" />
              <ProviderDetailRow label="Account status" value={status} />
              <ProviderDetailRow label="KYC status" value={kycStatus} />
            </ProviderDetailSection>

            <ProviderDetailSection title="Business information">
              <ProviderDetailRow label="Business name" value={firstText(record, ["companyName", "businessName", "name"])} />
              <ProviderDetailRow label="Coverage area" value={firstText(record, ["coverageArea", "location", "address"])} />
              <ProviderDetailRow label="Business registration number" value={firstText(record, ["businessRegistrationNumber", "brn"])} />
              <ProviderDetailRow label="Personnel count" value={firstText(record, ["personnelCount", "staffCount"])} />
              <ProviderDetailRow label="Services" value={text(record.services)} />
              <ProviderDetailRow label="Responsible contact" value={contactText(record.responsibleContact)} />
            </ProviderDetailSection>

            {hasMembership && (
              <ProviderDetailSection title="Membership">
                <ProviderDetailRow label="Plan" value={firstText(membership, ["plan"])} />
                <ProviderDetailRow label="Status" value={firstText(membership, ["status"])} />
                <ProviderDetailRow label="Joined" value={firstText(membership, ["joinedAt"])} />
                <ProviderDetailRow label="Expires" value={firstText(membership, ["expiresAt"])} />
              </ProviderDetailSection>
            )}

            <ProviderDetailSection title="Documents & verification">
              {evidence.length ? (
                <div className="divide-y">
                  {evidence.map((item, index) => (
                    <div key={String(item.url) + index} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-xs font-semibold text-muted-foreground">{firstText(item, ["label", "type"], `Evidence ${index + 1}`)}</span>
                      <a href={String(item.url)} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary underline">
                        View document
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <ProviderDetailEmpty message="No documents on file." />
              )}
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
          accountLabel="Company"
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

function Actions({ row, notify, onView }: { row: Row; notify: (message: string) => void; onView: (id: string) => void }) {
  const role = useUiStore((state) => state.role ?? state.user?.role); const allowed = hasPermission(role, Permission.COMPANIES);
  const status = useCompanyStatus(); const [pending, setPending] = React.useState<"activate" | "suspend" | null>(null); const [reason, setReason] = React.useState("");
  const statusIdempotencyKey = useIdempotencyKey(pending ? `${row.companyId}:${pending}` : row.companyId);
  async function confirm() {
    if (!pending) return;
    try {
      await status.mutateAsync({ companyId: row.companyId, action: pending, reason: pending === "suspend" ? reason : undefined, idempotencyKey: statusIdempotencyKey });
      notify(`Company ${pending === "activate" ? "activated" : "suspended"} successfully.`);
      setPending(null);
      setReason("");
    } catch (error) {
      notify(describeMutationError(error, `${pending === "activate" ? "Activating" : "Suspending"} this company`));
    }
  }
  const isBusy = status.isPending;
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${row.name}`} disabled={!allowed || isBusy}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onSelect={() => setTimeout(() => onView(row.companyId), 0)}>
            <Eye className="mr-2 h-4 w-4" />
            View Company
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
          accountLabel="Company"
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
const columns = (notify: (message: string) => void, onView: (id: string) => void): ColumnDef<Row>[] => [{ accessorKey: "name", header: "Company", cell: ({ row }) => <PersonCell name={row.original.name} sub={row.original.email} initials={row.original.name.slice(0, 2)} avatarTone="bg-black text-white" /> }, { accessorKey: "services", header: "Services", cell: ({ row }) => <ServiceTags services={row.original.services} /> }, { accessorKey: "phone", header: "Phone" }, { accessorKey: "location", header: "Coverage area", cell: ({ row }) => <span className="flex gap-2"><MapPin className="h-4 w-4" />{row.original.location}</span> }, { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> }, { id: "actions", header: "Actions", cell: ({ row }) => <Actions row={row.original} notify={notify} onView={onView} /> }];

export default function CompanyMechanicsPage() {
  const query = useCompanies(); const [toast, setToast] = React.useState(""); const [viewingId, setViewingId] = React.useState<string | null>(null); const [search, setSearch] = React.useState(""); const [status, setStatus] = React.useState("Status");
  const rows = React.useMemo(() => (query.data ?? []).map(map), [query.data]); const filtered = rows.filter((row) => (!search || [row.name, row.email, row.phone, row.location, ...row.services].join(" ").toLowerCase().includes(search.toLowerCase())) && (status === "Status" || row.status === status));
  return <div className="mx-auto max-w-[1600px] space-y-5"><PageHeader title="Companies" subtitle="Manage company verification and account status." /><CardShell><ToolbarCard><SearchBox placeholder="Search companies by name, email, phone or service..." value={search} onChange={setSearch} /><FilterSelect placeholder="Status" values={["Status", "Pending", "Active", "Suspended"]} value={status} onChange={setStatus} /></ToolbarCard>{query.isLoading ? <div className="flex gap-2 p-6 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading companies...</div> : query.isError ? <div className="flex gap-3 p-6 text-red-600">Unable to load companies.<Button size="sm" variant="outline" onClick={() => void query.refetch()}>Retry</Button></div> : filtered.length === 0 ? <div className="p-6 text-sm text-muted-foreground">{search || status !== "Status" ? "No companies match the current filters." : "No companies found."}</div> : <AdminDataTable data={filtered} columns={columns(setToast, setViewingId)} minWidth="1200px" rowLabel="companies" />}</CardShell>{toast && <div className="fixed bottom-5 right-5 rounded-xl border bg-card p-4 text-sm font-bold">{toast}</div>}{viewingId && <CompanyDetailsDialog id={viewingId} onOpenChange={(open) => !open && setViewingId(null)} notify={setToast} />}</div>;
}
