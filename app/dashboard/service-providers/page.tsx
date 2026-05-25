"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, Plus } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ExportButton,
  FilterButton,
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
import { serviceProviderMetrics, serviceProviders } from "@/lib/mock-data";

type ProviderRow = (typeof serviceProviders)[number];

const providerColumns: ColumnDef<ProviderRow>[] = [
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
  { id: "actions", header: "Actions", cell: () => <ActionMenu /> },
];

export default function ServiceProvidersPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Service Providers" subtitle="Manage and verify all service providers." />
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add New Provider
        </Button>
      </div>

      <MetricGrid metrics={serviceProviderMetrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search providers by name, email, phone or service..." />
          <FilterSelect placeholder="All Status" values={["All Status", "Verified", "Pending", "Rejected"]} />
          <FilterSelect placeholder="All Services" values={["All Services", "Battery", "Diagnostics", "Tire Change", "Towing"]} />
          <FilterSelect placeholder="Location" values={["Location", "Accra", "Tema", "Kasoa", "Madina"]} />
          <div className="flex gap-3">
            <FilterButton />
            <ExportButton />
          </div>
        </ToolbarCard>
        <AdminDataTable data={serviceProviders} columns={providerColumns} minWidth="1240px" />
        <PaginationFooter label="Showing 1 to 10 of 1,245 providers" pageCount="125" />
      </CardShell>
    </div>
  );
}
