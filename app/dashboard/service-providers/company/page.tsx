"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import {
  CheckCircle2, Clock3, Loader2, MapPin, MoreVertical,
  ShieldCheck, UserCheck, UserRoundX, Users, XCircle, Briefcase,
} from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ExportButton, FilterSelect, MetricGrid, PersonCell,
  SearchBox, ServiceTags, StatusCell, ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/api";
import { activeStatus, asRecord, firstText, initials, metricChange, metricDirection, metricValue, recordId, text } from "@/lib/live-data";
import { useCompanyMechanics, useCompanyMechanicStats, useCompanyMechanicAction } from "@/hooks/useMechanics";
import type { Company } from "@/types";

type CompanyRow = {
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
  return Array.from(new Set(services.map((s) => s.trim()).filter(Boolean)));
}

function mapCompanyMechanic(item: Company): CompanyRow {
  const root = item as unknown as Record<string, unknown>;
  const companyRecord = asRecord(root.company ?? root.provider ?? root.serviceProvider ?? root.business);
  const userRecord = asRecord(root.user ?? root.owner ?? root.admin);
  const record = { ...root, ...companyRecord };
  const name = firstText(record, ["name", "companyName", "businessName", "legalName"], text(userRecord, "Unnamed company"));
  const allServices = collectServices(
    record.services, record.service, record.serviceOffered,
    record.serviceCategories, record.specializations, record.skills,
    asRecord(record.profile).services, asRecord(userRecord.profile).services,
  );
  return {
    id: recordId(item) || String(root.providerId ?? root.companyId ?? ""),
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

function CompanyMechanicActions({ company, onToast }: { company: CompanyRow; onToast: (msg: string) => void }) {
  const action = useCompanyMechanicAction();

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
        <Button variant="ghost" size="icon" disabled={action.isPending}>
          {action.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={() => runAction("approve")} disabled={action.isPending}>
          <CheckCircle2 className="h-4 w-4" /> Approve Company
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runAction("reject")} disabled={action.isPending} className="text-red-600">
          <XCircle className="h-4 w-4" /> Reject Company
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runAction(suspended ? "activate" : "suspend")} disabled={action.isPending}>
          {suspended ? <UserCheck className="h-4 w-4" /> : <UserRoundX className="h-4 w-4" />}
          {suspended ? "Activate Company" : "Suspend Company"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const companyColumns = (onToast: (msg: string) => void): ColumnDef<CompanyRow>[] => [
  { accessorKey: "id", header: "Company ID", cell: ({ row }) => <span className="font-semibold">{row.original.id}</span> },
  {
    accessorKey: "name", header: "Company",
    cell: ({ row }) => <PersonCell name={row.original.name} sub={row.original.email} initials={row.original.initials} avatarTone={row.original.avatarTone} />,
  },
  {
    accessorKey: "services", header: "Service(s)",
    cell: ({ row }) => row.original.services.length
      ? <ServiceTags services={row.original.services} extra={row.original.extraServices} />
      : <span className="text-xs font-semibold text-muted-foreground">No services listed</span>,
  },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "location", header: "Location",
    cell: ({ row }) => (
      <span className="flex min-w-[160px] items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />{row.original.location}
      </span>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { id: "actions", header: "Actions", cell: ({ row }) => <CompanyMechanicActions company={row.original} onToast={onToast} /> },
];

export default function CompanyMechanicsPage() {
  const [toast, setToast] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All Status");

  const companiesQuery = useCompanyMechanics();
  const statsQuery = useCompanyMechanicStats();

  const rows = React.useMemo(() => (companiesQuery.data ?? []).map(mapCompanyMechanic), [companiesQuery.data]);
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
    { label: "Total Companies", value: metricValue(stats, ["total", "totalCompanies"], String(rows.length)), change: metricChange(stats, ["total", "totalCompanies"]), direction: metricDirection(stats, ["total", "totalCompanies"]), tone: "red", icon: Users },
    { label: "Approved", value: metricValue(stats, ["approved", "approvedCompanies"], String(rows.filter((r) => r.status.toLowerCase().includes("approved") || r.status.toLowerCase().includes("verified")).length)), change: metricChange(stats, ["approved"]), direction: metricDirection(stats, ["approved"]), tone: "green", icon: ShieldCheck },
    { label: "Pending Verification", value: metricValue(stats, ["pending", "pendingCompanies"], String(rows.filter((r) => r.status.toLowerCase().includes("pending")).length)), change: metricChange(stats, ["pending"]), direction: metricDirection(stats, ["pending"]), tone: "amber", icon: Clock3 },
    { label: "Rejected", value: metricValue(stats, ["rejected", "rejectedCompanies"], String(rows.filter((r) => r.status.toLowerCase().includes("reject")).length)), change: metricChange(stats, ["rejected"]), direction: metricDirection(stats, ["rejected"]), tone: "red", icon: XCircle },
    { label: "Active Companies", value: metricValue(stats, ["active", "activeCompanies"], String(rows.filter((r) => r.status.toLowerCase().includes("active") || r.status.toLowerCase().includes("verified")).length)), change: metricChange(stats, ["active"]), direction: metricDirection(stats, ["active"]), tone: "blue", icon: Briefcase },
  ];

  const exportData = React.useMemo(
    () => filteredRows.map(({ id, name, email, phone, location, status }) => ({ id, name, email, phone, location, status })),
    [filteredRows],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Company Mechanics" subtitle="Manage and verify company-based mechanic service providers." />
      <MetricGrid metrics={metrics} />
      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search companies by name, email, phone or service..." value={query} onChange={setQuery} />
          <FilterSelect placeholder="All Status" values={["All Status", "Verified", "Pending", "Rejected"]} value={status} onChange={setStatus} />
          <FilterSelect placeholder="All Services" values={["All Services", "Battery", "Diagnostics", "Tire Change", "Towing"]} />
          <FilterSelect placeholder="Location" values={["Location", "Accra", "Tema", "Kasoa", "Madina"]} />
          <ExportButton data={exportData} filename="company-mechanics" />
        </ToolbarCard>
        {companiesQuery.isLoading ? (
          <div className="p-6 text-sm font-semibold text-muted-foreground">Loading companies...</div>
        ) : companiesQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-red-600">Unable to load companies.</div>
        ) : (
          <AdminDataTable data={filteredRows} columns={companyColumns(setToast)} minWidth="1340px" rowLabel="companies" />
        )}
      </CardShell>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}