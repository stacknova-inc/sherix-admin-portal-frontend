"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { Loader2, MapPin, ShieldCheck, Users, Clock3, XCircle, Briefcase } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ExportButton,
  FilterSelect,
  MetricGrid,
  PaginationFooter,
  PersonCell,
  RatingStars,
  SearchBox,
  ServiceTags,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";
import { activeStatus, asRecord, dateText, firstText, initials, recordId, text } from "@/lib/live-data";
import { useCompanies, useCompanyAction } from "@/hooks/useCompanies";
import type { Company, Service } from "@/types";

type ProviderRow = {
  id: string;
  name: string;
  email: string;
  services: string[];
  extraServices: number;
  phone: string;
  location: string;
  rating: number;
  reviews: number;
  status: string;
  joinedDate: string;
  initials: string;
  avatarTone: string;
};

function mapCompany(company: Company): ProviderRow {
  const record = company as unknown as Record<string, unknown>;
  const name = firstText(record, ["name", "companyName", "businessName"], "Unnamed company");
  const allServices = Array.isArray(company.services)
    ? company.services.map((service) => (typeof service === "string" ? service : text((service as Service).name ?? (service as Service).title))).filter(Boolean)
    : [];
  return {
    id: recordId(company),
    name,
    email: firstText(record, ["email"]),
    services: allServices.slice(0, 2),
    extraServices: Math.max(0, allServices.length - 2),
    phone: firstText(record, ["phone", "phoneNumber"]),
    location: firstText(record, ["location", "address"]),
    rating: Number(record.rating ?? 0),
    reviews: Number(record.reviews ?? record.reviewCount ?? 0),
    status: activeStatus(record),
    joinedDate: dateText(company.createdAt),
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
    <div className="flex min-w-[260px] justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => runAction("approve")} disabled={action.isPending}>
        Approve
      </Button>
      <Button variant="outline" size="sm" onClick={() => runAction("reject")} disabled={action.isPending}>
        Reject
      </Button>
      <Button variant="outline" size="sm" onClick={() => runAction(suspended ? "activate" : "suspend")} disabled={action.isPending}>
        {action.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {suspended ? "Activate" : "Suspend"}
      </Button>
    </div>
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
    cell: ({ row }) => <ServiceTags services={row.original.services} extra={row.original.extraServices} />,
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
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <RatingStars rating={row.original.rating} />
        <span className="ml-1 text-xs text-muted-foreground">({row.original.reviews})</span>
      </div>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { accessorKey: "joinedDate", header: "Joined Date" },
  { id: "actions", header: "Actions", cell: ({ row }) => <CompanyActions company={row.original} onToast={onToast} /> },
];

export default function ServiceProvidersPage() {
  const [toast, setToast] = React.useState("");
  const companiesQuery = useCompanies();
  const rows = React.useMemo(() => (companiesQuery.data ?? []).map(mapCompany), [companiesQuery.data]);
  const metrics = [
    { label: "Total Companies", value: String(rows.length), change: "Live backend data", direction: "up", tone: "red", icon: Users },
    { label: "Approved Companies", value: String(rows.filter((row) => row.status.toLowerCase().includes("approved") || row.status.toLowerCase().includes("verified")).length), change: "Live backend data", direction: "up", tone: "green", icon: ShieldCheck },
    { label: "Pending Verification", value: String(rows.filter((row) => row.status.toLowerCase().includes("pending")).length), change: "Live backend data", direction: "up", tone: "amber", icon: Clock3 },
    { label: "Rejected Companies", value: String(rows.filter((row) => row.status.toLowerCase().includes("reject")).length), change: "Live backend data", direction: "down", tone: "red", icon: XCircle },
    { label: "Active Companies", value: String(rows.filter((row) => row.status.toLowerCase().includes("active") || row.status.toLowerCase().includes("verified")).length), change: "Live backend data", direction: "up", tone: "blue", icon: Briefcase },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Service Providers" subtitle="Manage and verify all service providers." />
      </div>

      <MetricGrid metrics={metrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search providers by name, email, phone or service..." />
          <FilterSelect placeholder="All Status" values={["All Status", "Verified", "Pending", "Rejected"]} />
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
          <AdminDataTable data={rows} columns={providerColumns(setToast)} minWidth="1340px" />
        )}
        <PaginationFooter label={`Showing ${rows.length ? `1 to ${rows.length}` : "0"} of ${rows.length} companies`} pageCount={String(Math.max(1, Math.ceil(rows.length / 10)))} />
      </CardShell>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
