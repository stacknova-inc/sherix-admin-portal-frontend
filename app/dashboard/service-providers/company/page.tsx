"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Check, Eye, Loader2, MapPin, MoreVertical, UserCheck, UserRoundX, X } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { AccountStateDialog } from "@/components/shared/AccountStateDialog";
import { RejectReasonDialog } from "@/components/shared/RejectReasonDialog";
import { DetailGrid, DetailSection } from "@/components/shared/DetailField";
import { FilterSelect, PersonCell, SearchBox, ServiceTags, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/api";
import { hasPermission, Permission } from "@/lib/rbac";
import { activeStatus, asRecord, firstText, recordId, text } from "@/lib/live-data";
import { useCompanies, useCompanyStatus, useCompanyVerification } from "@/hooks/useCompanies";
import { useUiStore } from "@/store/use-ui-store";
import type { Company } from "@/types";

type Row = { companyId: string; name: string; email: string; phone: string; services: string[]; location: string; verificationStatus: "Approved" | "Rejected"; status: "Active" | "Suspended" };
const services = (source: unknown) => Array.isArray(source) ? source.map((item) => typeof item === "string" ? item : String((item as { name?: string }).name ?? "")).filter(Boolean) : [];
const map = (company: Company): Row => ({ companyId: company.companyId ?? company.id ?? company._id ?? "", name: company.name ?? company.companyName ?? "Unnamed company", email: company.email ?? "-", phone: company.phone ?? "-", services: services(company.services), location: company.coverageArea ?? company.location ?? company.address ?? "-", verificationStatus: company.verificationStatus?.toLowerCase() === "rejected" || company.isApproved === false ? "Rejected" : "Approved", status: company.status?.toLowerCase() === "suspended" || company.isActive === false ? "Suspended" : "Active" });

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

function CompanyDetailsDialog({ id, onOpenChange }: { id: string; onOpenChange: (open: boolean) => void }) {
  const query = useCompanies();
  const company = (query.data ?? []).find(
    (item) => recordId(item) === id || String(asRecord(item).companyId ?? "") === id,
  );
  const record = asRecord(company);
  const name = firstText(record, ["name", "companyName", "businessName"], "Company details");
  const evidence = evidenceList(record.identityEvidence, record.businessEvidence);
  const membership = asRecord(record.membership);
  const hasMembership = Object.values(membership).some((value) => value !== undefined && value !== null && value !== "");

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Company profile and account details from the backend.</DialogDescription>
        </DialogHeader>
        {query.isLoading ? (
          <p className="text-sm font-semibold text-muted-foreground">Loading company details...</p>
        ) : query.isError || !company ? (
          <p className="text-sm font-semibold text-red-600">Unable to load company details.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
                <Building2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-black">{name}</p>
                <StatusCell status={activeStatus(record)} />
              </div>
            </div>

            <DetailSection title="Business">
              <DetailGrid
                fields={[
                  ["Email", firstText(record, ["email"])],
                  ["Phone", firstText(record, ["phone"])],
                  ["Coverage area", firstText(record, ["coverageArea", "location", "address"])],
                  ["Verification status", firstText(record, ["verificationStatus"], "Approved")],
                  ["Business registration number", firstText(record, ["businessRegistrationNumber", "brn"], "Not available")],
                  ["Responsible contact", contactText(record.responsibleContact)],
                  ["Personnel count", firstText(record, ["personnelCount", "staffCount"], "Not available")],
                  ["Services", text(record.services)],
                ]}
              />
            </DetailSection>

            <DetailSection title="Identity & business evidence">
              {evidence.length ? (
                <ul className="space-y-2">
                  {evidence.map((item, index) => (
                    <li key={String(item.url) + index}>
                      <a
                        href={String(item.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-primary underline"
                      >
                        {firstText(item, ["label", "type"], `Evidence ${index + 1}`)}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-semibold text-muted-foreground">No evidence on file.</p>
              )}
            </DetailSection>

            <DetailSection title="Membership">
              {hasMembership ? (
                <DetailGrid
                  fields={[
                    ["Plan", firstText(membership, ["plan"], "Not available")],
                    ["Status", firstText(membership, ["status"], "Not available")],
                    ["Joined", firstText(membership, ["joinedAt"], "Not available")],
                    ["Expires", firstText(membership, ["expiresAt"], "Not available")],
                  ]}
                />
              ) : (
                <p className="text-sm font-semibold text-muted-foreground">No membership information available.</p>
              )}
            </DetailSection>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Actions({ row, notify, onView }: { row: Row; notify: (message: string) => void; onView: (id: string) => void }) {
  const role = useUiStore((state) => state.role ?? state.user?.role); const allowed = hasPermission(role, Permission.COMPANIES);
  const verification = useCompanyVerification(); const status = useCompanyStatus(); const [pending, setPending] = React.useState<"activate" | "suspend" | null>(null); const [reason, setReason] = React.useState("");
  const [rejecting, setRejecting] = React.useState(false); const [rejectReason, setRejectReason] = React.useState("");
  async function approve() { try { await verification.mutateAsync({ companyId: row.companyId, action: "approve" }); notify("Company approved. An email notification will be sent to the company."); } catch (error) { notify(getErrorMessage(error, "Unable to approve company")); } }
  async function confirmReject() { try { await verification.mutateAsync({ companyId: row.companyId, action: "reject", reason: rejectReason }); notify("Company rejected. An email notification will be sent to the company."); setRejecting(false); setRejectReason(""); } catch (error) { notify(getErrorMessage(error, "Unable to reject company")); } }
  async function confirm() { if (!pending) return; try { await status.mutateAsync({ companyId: row.companyId, action: pending, reason: pending === "suspend" ? reason : undefined }); notify(`Company ${pending === "activate" ? "activated" : "suspended"}. An email notification will be sent to the company.`); setPending(null); setReason(""); } catch (error) { notify(getErrorMessage(error, `Unable to ${pending} company`)); } }
  const isBusy = verification.isPending || status.isPending;
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
          <DropdownMenuItem onClick={() => void approve()} disabled={row.verificationStatus === "Approved"}>
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
          accountLabel="Company"
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
          accountLabel="Company"
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
const columns = (notify: (message: string) => void, onView: (id: string) => void): ColumnDef<Row>[] => [{ accessorKey: "companyId", header: "Company ID" }, { accessorKey: "name", header: "Company", cell: ({ row }) => <PersonCell name={row.original.name} sub={row.original.email} initials={row.original.name.slice(0, 2)} avatarTone="bg-black text-white" /> }, { accessorKey: "services", header: "Services", cell: ({ row }) => <ServiceTags services={row.original.services} /> }, { accessorKey: "phone", header: "Phone" }, { accessorKey: "location", header: "Coverage area", cell: ({ row }) => <span className="flex gap-2"><MapPin className="h-4 w-4" />{row.original.location}</span> }, { accessorKey: "verificationStatus", header: "Verification Status", cell: ({ row }) => <StatusCell status={row.original.verificationStatus} /> }, { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> }, { id: "actions", header: "Actions", cell: ({ row }) => <Actions row={row.original} notify={notify} onView={onView} /> }];

export default function CompanyMechanicsPage() {
  const query = useCompanies(); const [toast, setToast] = React.useState(""); const [viewingId, setViewingId] = React.useState<string | null>(null); const [search, setSearch] = React.useState(""); const [status, setStatus] = React.useState("Status"); const [verification, setVerification] = React.useState("Verification");
  const rows = React.useMemo(() => (query.data ?? []).map(map), [query.data]); const filtered = rows.filter((row) => (!search || [row.name, row.email, row.phone, row.location, ...row.services].join(" ").toLowerCase().includes(search.toLowerCase())) && (status === "Status" || row.status === status) && (verification === "Verification" || row.verificationStatus === verification));
  return <div className="mx-auto max-w-[1600px] space-y-5"><PageHeader title="Companies" subtitle="Manage company verification and account status." /><CardShell><ToolbarCard><SearchBox placeholder="Search companies by name, email, phone or service..." value={search} onChange={setSearch} /><FilterSelect placeholder="Status" values={["Status", "Active", "Suspended"]} value={status} onChange={setStatus} /><FilterSelect placeholder="Verification" values={["Verification", "Approved", "Rejected"]} value={verification} onChange={setVerification} /></ToolbarCard>{query.isLoading ? <div className="flex gap-2 p-6 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading companies...</div> : query.isError ? <div className="flex gap-3 p-6 text-red-600">Unable to load companies.<Button size="sm" variant="outline" onClick={() => void query.refetch()}>Retry</Button></div> : filtered.length === 0 ? <div className="p-6 text-sm text-muted-foreground">{search || status !== "Status" || verification !== "Verification" ? "No companies match the current filters." : "No companies found."}</div> : <AdminDataTable data={filtered} columns={columns(setToast, setViewingId)} minWidth="1280px" rowLabel="companies" />}</CardShell>{toast && <div className="fixed bottom-5 right-5 rounded-xl border bg-card p-4 text-sm font-bold">{toast}</div>}{viewingId && <CompanyDetailsDialog id={viewingId} onOpenChange={(open) => !open && setViewingId(null)} />}</div>;
}
