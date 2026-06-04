"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { CheckCircle2, Clock3, Loader2, MapPin, MoreVertical, ShieldCheck, UserCheck, UserRoundX, Users, XCircle, Briefcase } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ExportButton,
  FilterSelect,
  MetricGrid,
  PersonCell,
  SearchBox,
  ServiceTags,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/api";
import { activeStatus, asRecord, firstText, initials, metricChange, metricDirection, metricValue, recordId, text } from "@/lib/live-data";
import { useCompanies, useCompanyAction, useCompanyStats } from "@/hooks/useCompanies";
import type { Company } from "@/types";

type ProviderRow = {
  id: string;
  name: string;
  email: string;
  services: string[];
  extraServices: number;
  phone: string;
  location: string;
  status: string;
  initials: string;
  avatarTone: string;
};

function serviceLabel(service: unknown) {
  if (typeof service === "string") return service;
  const record = asRecord(service);
  return text(record.name ?? record.title ?? record.serviceName ?? record.categoryName ?? record.label ?? record.issueTitle, "");
}

function collectServices(...sources: unknown[]) {
  const services = sources.flatMap((source) => {
    if (!source) return [];
    if (Array.isArray(source)) return source.map(serviceLabel);
    return [serviceLabel(source)];
  });

  return Array.from(new Set(services.map((service) => service.trim()).filter(Boolean)));
}

function mapCompany(company: Company): ProviderRow {
  const root = company as unknown as Record<string, unknown>;
  const companyRecord = asRecord(root.company ?? root.provider ?? root.serviceProvider ?? root.business);
  const userRecord = asRecord(root.user ?? root.owner ?? root.admin);
  const record = { ...root, ...companyRecord };
  const name = firstText(record, ["name", "companyName", "businessName", "legalName"], text(userRecord, "Unnamed company"));
  const allServices = collectServices(
    record.services,
    record.service,
    record.serviceOffered,
    record.serviceOffers,
    record.serviceCategories,
    record.categories,
    record.specializations,
    record.skills,
    record.issues,
    asRecord(record.profile).services,
    asRecord(userRecord.profile).services,
  );
  return {
    id: recordId(company) || String(root.providerId ?? root.companyId ?? ""),
    name,
    email: firstText(record, ["email"], firstText(userRecord, ["email"])),
    services: allServices.slice(0, 2),
    extraServices: Math.max(0, allServices.length - 2),
    phone: firstText(record, ["phone", "phoneNumber", "contactPhone"], firstText(userRecord, ["phone", "phoneNumber"])),
    location: firstText(record, ["location", "address"]),
    status: activeStatus(record),
    initials: initials(name),
    avatarTone: "bg-black text-white",
  };
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return <div className="fixed bottom-5 right-5 z-50 rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl">{message}</div>;
}

function CompanyActions({ company, onToast }: { company: ProviderRow; onToast: (message: string) => void }) {
  const action = useCompanyAction();

  async function runAction(nextAction: "approve" | "reject" | "suspend" | "activate") {
    try {
      const reason = nextAction === "reject" ? window.prompt("Reason for rejection") ?? undefined : undefined;
      await action.mutateAsync({ id: company.id, action: nextAction, reason });
      onToast(`Company ${nextAction}d successfully.`);
    } catch (error) {
      onToast(getErrorMessage(error, `Unable to ${nextAction} company`));
    }
  }

  const suspended = company.status.toLowerCase().includes("suspend") || company.status.toLowerCase().includes("inactive");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${company.name}`} disabled={action.isPending}>
          {action.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={() => runAction("approve")} disabled={action.isPending}>
          <CheckCircle2 className="h-4 w-4" />
          Approve Company
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runAction("reject")} disabled={action.isPending} className="text-red-600">
          <XCircle className="h-4 w-4" />
          Reject Company
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runAction(suspended ? "activate" : "suspend")} disabled={action.isPending}>
          {suspended ? <UserCheck className="h-4 w-4" /> : <UserRoundX className="h-4 w-4" />}
          {suspended ? "Activate Company" : "Suspend Company"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const providerColumns = (onToast: (message: string) => void): ColumnDef<ProviderRow>[] => [
  { accessorKey: "id", header: "Provider ID", cell: ({ row }) => <span className="font-semibold">{row.original.id}</span> },
  {
    accessorKey: "name",
    header: "Provider",
    cell: ({ row }) => (
      <PersonCell name={row.original.name} sub={row.original.email} initials={row.original.initials} avatarTone={row.original.avatarTone} />
    ),
  },
  {
    accessorKey: "services",
    header: "Service(s)",
    cell: ({ row }) =>
      row.original.services.length ? (
        <ServiceTags services={row.original.services} extra={row.original.extraServices} />
      ) : (
        <span className="text-xs font-semibold text-muted-foreground">No services listed</span>
      ),
  },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="flex min-w-[160px] items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        {row.original.location}
      </span>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { id: "actions", header: "Actions", cell: ({ row }) => <CompanyActions company={row.original} onToast={onToast} /> },
];

export default function ServiceProvidersPage() {
  const [toast, setToast] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All Status");
  const companiesQuery = useCompanies();
  const statsQuery = useCompanyStats();
  const rows = React.useMemo(() => (companiesQuery.data ?? []).map(mapCompany), [companiesQuery.data]);
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !search || [row.name, row.email, row.phone, row.location, row.status, ...row.services].join(" ").toLowerCase().includes(search);
      const matchesStatus = status === "All Status" || row.status.toLowerCase().includes(status.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [query, rows, status]);
  const stats = asRecord(statsQuery.data);
  const metrics = [
    { label: "Total Companies", value: metricValue(stats, ["totalCompanies", "totalProviders", "serviceProviders", "total"], String(rows.length)), change: metricChange(stats, ["totalCompanies", "totalProviders", "serviceProviders", "total"]), direction: metricDirection(stats, ["totalCompanies", "totalProviders", "serviceProviders", "total"]), tone: "red", icon: Users },
    { label: "Approved Companies", value: metricValue(stats, ["approvedCompanies", "approvedProviders", "verifiedProviders", "approved"], String(rows.filter((row) => row.status.toLowerCase().includes("approved") || row.status.toLowerCase().includes("verified")).length)), change: metricChange(stats, ["approvedCompanies", "approvedProviders", "verifiedProviders", "approved"]), direction: metricDirection(stats, ["approvedCompanies", "approvedProviders", "verifiedProviders", "approved"]), tone: "green", icon: ShieldCheck },
    { label: "Pending Verification", value: metricValue(stats, ["pendingVerification", "pendingProviders", "pending"], String(rows.filter((row) => row.status.toLowerCase().includes("pending")).length)), change: metricChange(stats, ["pendingVerification", "pendingProviders", "pending"]), direction: metricDirection(stats, ["pendingVerification", "pendingProviders", "pending"]), tone: "amber", icon: Clock3 },
    { label: "Rejected Companies", value: metricValue(stats, ["rejectedCompanies", "rejectedProviders", "rejected"], String(rows.filter((row) => row.status.toLowerCase().includes("reject")).length)), change: metricChange(stats, ["rejectedCompanies", "rejectedProviders", "rejected"], "Live backend data"), direction: metricDirection(stats, ["rejectedCompanies", "rejectedProviders", "rejected"], "down"), tone: "red", icon: XCircle },
    { label: "Active Companies", value: metricValue(stats, ["activeCompanies", "activeProviders", "active"], String(rows.filter((row) => row.status.toLowerCase().includes("active") || row.status.toLowerCase().includes("verified")).length)), change: metricChange(stats, ["activeCompanies", "activeProviders", "active"]), direction: metricDirection(stats, ["activeCompanies", "activeProviders", "active"]), tone: "blue", icon: Briefcase },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Service Providers" subtitle="Manage and verify all service providers." />
      </div>

      <MetricGrid metrics={metrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search providers by name, email, phone or service..." value={query} onChange={setQuery} />
          <FilterSelect placeholder="All Status" values={["All Status", "Verified", "Pending", "Rejected"]} value={status} onChange={setStatus} />
          <FilterSelect placeholder="All Services" values={["All Services", "Battery", "Diagnostics", "Tire Change", "Towing"]} />
          <FilterSelect placeholder="Location" values={["Location", "Accra", "Tema", "Kasoa", "Madina"]} />
          <div className="flex gap-3">
            <ExportButton />
          </div>
        </ToolbarCard>
        {companiesQuery.isLoading ? (
          <div className="p-6 text-sm font-semibold text-muted-foreground">Loading companies...</div>
        ) : companiesQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-red-600">Unable to load companies.</div>
        ) : (
          <AdminDataTable data={filteredRows} columns={providerColumns(setToast)} minWidth="1340px" rowLabel="companies" />
        )}
      </CardShell>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
