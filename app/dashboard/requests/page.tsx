"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Briefcase,
  CalendarX,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { ExportButton, FilterSelect, MetricGrid, SearchBox, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { DataFreshness } from "@/components/shared/DataFreshness";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getErrorMessage } from "@/lib/api";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { asRecord, dateText, firstText, formatStatusLabel, metricValue, money, recordId } from "@/lib/live-data";
import { priceSummary, resolveServiceName, serviceRequestDisplayId } from "@/lib/service-request-helpers";
import { hasPermission, Permission } from "@/lib/rbac";
import { useUiStore } from "@/store/use-ui-store";
import { useCompanies } from "@/hooks/useCompanies";
import { useServices } from "@/hooks/useServices";
import { useServiceRequestStats, useServiceRequests } from "@/hooks/useServiceRequests";
import type { ServiceRequest, ServiceRequestListParams } from "@/types";

const PAGE_SIZE = 20;
const DEFAULT_RADIUS_KM = 50;
const ALL_VALUE = "all";
const AUTO_REFRESH_MS = 45_000;

const STATUS_OPTIONS = [
  "requested",
  "mechanic_accepted",
  "en_route",
  "arrived",
  "inspecting",
  "diagnosis_completed",
  "price_update_pending",
  "price_approved",
  "in_progress",
  "finalizing",
  "completed",
  "cancelled",
  "disputed",
  "expired",
];

const PRIORITY_OPTIONS = ["low", "medium", "high"];

function toIsoStart(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined;
}

function toIsoEnd(value: string) {
  return value ? new Date(`${value}T23:59:59.999Z`).toISOString() : undefined;
}

type ServiceRequestRow = {
  id: string;
  displayId: string;
  customer: string;
  service: string;
  mechanic: string;
  priority: string;
  status: string;
  price: string;
  paymentStatus: string;
  created: string;
};

function mapRow(request: ServiceRequest, services: { _id?: string; id?: string; name?: string; title?: string }[]): ServiceRequestRow {
  const mechanicRecord = asRecord(request.mechanicId);

  return {
    id: recordId(request),
    displayId: serviceRequestDisplayId(request),
    customer: request.customerName || "-",
    service: resolveServiceName(request.serviceId, services),
    mechanic: firstText(mechanicRecord, ["name"], "") || (request.mechanicId ? "-" : "Unassigned"),
    priority: formatStatusLabel(request.priority, "-"),
    status: request.status || "requested",
    price: priceSummary(request, money),
    paymentStatus: request.paymentStatus || (request.isPaid ? "Paid" : "Unpaid"),
    created: dateText(request.createdAt),
  };
}

type LocationFilter = { latitude: number; longitude: number; radiusKm: number };

function LocationFilterPopover({ value, onApply, onClear }: { value: LocationFilter | null; onApply: (value: LocationFilter) => void; onClear: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [latitude, setLatitude] = React.useState(value ? String(value.latitude) : "");
  const [longitude, setLongitude] = React.useState(value ? String(value.longitude) : "");
  const [radiusKm, setRadiusKm] = React.useState(value ? String(value.radiusKm) : String(DEFAULT_RADIUS_KM));

  React.useEffect(() => {
    if (!open) return;
    setLatitude(value ? String(value.latitude) : "");
    setLongitude(value ? String(value.longitude) : "");
    setRadiusKm(value ? String(value.radiusKm) : String(DEFAULT_RADIUS_KM));
  }, [open, value]);

  const lat = Number(latitude);
  const lng = Number(longitude);
  const radius = Number(radiusKm || DEFAULT_RADIUS_KM);
  const canApply = latitude.trim() !== "" && longitude.trim() !== "" && Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 bg-card">
          <MapPin className="h-4 w-4" />
          {value ? `${value.latitude.toFixed(3)}, ${value.longitude.toFixed(3)} · ${value.radiusKm}km` : "Location"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3" align="start">
        <p className="text-xs font-bold">Filter by proximity</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-xs font-semibold">
            Latitude
            <Input inputMode="decimal" placeholder="e.g. 5.6037" value={latitude} onChange={(event) => setLatitude(event.target.value)} className="bg-card" />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Longitude
            <Input inputMode="decimal" placeholder="e.g. -0.1870" value={longitude} onChange={(event) => setLongitude(event.target.value)} className="bg-card" />
          </label>
        </div>
        <label className="grid gap-1 text-xs font-semibold">
          Radius (km)
          <Input inputMode="numeric" placeholder={String(DEFAULT_RADIUS_KM)} value={radiusKm} onChange={(event) => setRadiusKm(event.target.value)} className="bg-card" />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
            >
              Clear
            </Button>
          )}
          <Button
            size="sm"
            disabled={!canApply}
            onClick={() => {
              onApply({ latitude: lat, longitude: lng, radiusKm: Number.isFinite(radius) && radius > 0 ? radius : DEFAULT_RADIUS_KM });
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function ServiceRequestsPage() {
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const allowed = hasPermission(role, Permission.SERVICE_REQUESTS);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState(ALL_VALUE);
  const [priority, setPriority] = React.useState(ALL_VALUE);
  const [serviceId, setServiceId] = React.useState(ALL_VALUE);
  const [companyId, setCompanyId] = React.useState(ALL_VALUE);
  const [customer, setCustomer] = React.useState("");
  const [mechanic, setMechanic] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [location, setLocation] = React.useState<LocationFilter | null>(null);
  const [page, setPage] = React.useState(1);

  const debouncedSearch = useDebouncedValue(search);
  const debouncedCustomer = useDebouncedValue(customer);
  const debouncedMechanic = useDebouncedValue(mechanic);

  const hasActiveFilters = Boolean(
    status !== ALL_VALUE ||
      priority !== ALL_VALUE ||
      serviceId !== ALL_VALUE ||
      companyId !== ALL_VALUE ||
      debouncedCustomer ||
      debouncedMechanic ||
      startDate ||
      endDate ||
      location ||
      debouncedSearch,
  );

  const params: ServiceRequestListParams = React.useMemo(() => {
    const next: ServiceRequestListParams = { page, limit: PAGE_SIZE };
    if (status !== ALL_VALUE) next.status = status;
    if (priority !== ALL_VALUE) next.priority = priority;
    if (serviceId !== ALL_VALUE) next.serviceId = serviceId;
    if (companyId !== ALL_VALUE) next.companyId = companyId;
    if (debouncedCustomer.trim()) next.customer = debouncedCustomer.trim();
    if (debouncedMechanic.trim()) next.mechanic = debouncedMechanic.trim();
    if (debouncedSearch.trim()) next.search = debouncedSearch.trim();
    const isoStart = toIsoStart(startDate);
    const isoEnd = toIsoEnd(endDate);
    if (isoStart) next.startDate = isoStart;
    if (isoEnd) next.endDate = isoEnd;
    if (location) {
      next.latitude = location.latitude;
      next.longitude = location.longitude;
      next.radiusKm = location.radiusKm;
    }
    return next;
   
  }, [page, status, priority, serviceId, companyId, debouncedCustomer, debouncedMechanic, debouncedSearch, startDate, endDate, location]);

  const filterSignature = JSON.stringify({ status, priority, serviceId, companyId, debouncedCustomer, debouncedMechanic, debouncedSearch, startDate, endDate, location });
  React.useEffect(() => {
    setPage(1);
 
  }, [filterSignature]);

  const requestsQuery = useServiceRequests(params);
  const statsQuery = useServiceRequestStats();
  const servicesQuery = useServices();
  const companiesQuery = useCompanies();

  
  useAutoRefresh([["serviceRequests", "list"], ["serviceRequests", "stats"]], AUTO_REFRESH_MS);

  const isBackgroundRefreshing = (requestsQuery.isFetching || statsQuery.isFetching) && !requestsQuery.isLoading;

  const services = servicesQuery.data ?? [];
  const companies = companiesQuery.data ?? [];
  const requests = requestsQuery.data?.data ?? [];
  const pagination = requestsQuery.data?.pagination;

  const rows = React.useMemo(() => requests.map((request) => mapRow(request, services)), [requests, services]);


  const stats = asRecord(statsQuery.data);
  const metrics = [
    {
      label: "Total Service Requests",
      value: pagination ? String(pagination.total) : metricValue(stats, ["totalRequests", "totalServiceRequests", "total"], String(rows.length)),
      change: "Live backend data",
      direction: "up" as const,
      tone: "blue",
      icon: Briefcase,
    },
    { label: "Requested", value: metricValue(stats, ["requested", "pending"], "-"), change: "Live backend data", direction: "up" as const, tone: "amber", icon: Clock3 },
    { label: "Completed", value: metricValue(stats, ["completed", "completedJobs"], "-"), change: "Live backend data", direction: "up" as const, tone: "green", icon: CheckCircle2 },
    { label: "Expired", value: metricValue(stats, ["expired", "expiredJobs"], "-"), change: "Live backend data", direction: "down" as const, tone: "red", icon: CalendarX },
  ];

  const exportData = React.useMemo(
    () =>
      rows.map(({ displayId, customer, service, mechanic, priority, status, price, paymentStatus, created }) => ({
        displayId,
        customer,
        service,
        mechanic,
        priority,
        status,
        price,
        paymentStatus,
        created,
      })),
    [rows],
  );

  function clearFilters() {
    setSearch("");
    setStatus(ALL_VALUE);
    setPriority(ALL_VALUE);
    setServiceId(ALL_VALUE);
    setCompanyId(ALL_VALUE);
    setCustomer("");
    setMechanic("");
    setStartDate("");
    setEndDate("");
    setLocation(null);
  }

  const columns: ColumnDef<ServiceRequestRow>[] = [
    { accessorKey: "displayId", header: "Service Request ID", cell: ({ row }) => <span className="font-black">{row.original.displayId}</span> },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "service", header: "Service Type" },
    { accessorKey: "mechanic", header: "Assigned Mechanic" },
    { accessorKey: "priority", header: "Priority" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
    { accessorKey: "price", header: "Quotation / Price", cell: ({ row }) => <span className="font-bold">{row.original.price}</span> },
    { accessorKey: "paymentStatus", header: "Payment Status", cell: ({ row }) => <StatusCell status={row.original.paymentStatus} /> },
    { accessorKey: "created", header: "Created Date" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" aria-label={`View service request ${row.original.displayId}`} asChild>
          <Link href={`/dashboard/requests/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Service Requests" subtitle="Complete operational visibility into every service request across the platform." />
        <div role="status">
          <DataFreshness
            isFetching={isBackgroundRefreshing}
            dataUpdatedAt={requestsQuery.dataUpdatedAt}
            isRefreshError={requestsQuery.isError && requestsQuery.data !== undefined}
            onRetry={() => void requestsQuery.refetch()}
          />
        </div>
      </div>
      <MetricGrid metrics={metrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search service requests by ID, customer, mechanic..." value={search} onChange={setSearch} />
          <FilterSelect
            placeholder="All Statuses"
            options={[{ label: "All Statuses", value: ALL_VALUE }, ...STATUS_OPTIONS.map((option) => ({ label: formatStatusLabel(option), value: option }))]}
            value={status}
            onChange={setStatus}
            className="lg:w-[190px]"
          />
          <FilterSelect
            placeholder="All Priorities"
            options={[{ label: "All Priorities", value: ALL_VALUE }, ...PRIORITY_OPTIONS.map((option) => ({ label: formatStatusLabel(option), value: option }))]}
            value={priority}
            onChange={setPriority}
            className="lg:w-[160px]"
          />
          <div className="flex flex-wrap gap-2">
            <ExportButton data={exportData} filename="service-requests" title="Service Requests" />
            {hasActiveFilters && (
              <Button variant="outline" className="bg-card" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </ToolbarCard>

        <div className="flex flex-wrap items-center gap-2.5 border-b p-3">
          <FilterSelect
            placeholder="All Services"
            options={[
              { label: "All Services", value: ALL_VALUE },
              ...services.filter((service) => recordId(service)).map((service) => ({ label: service.name || service.title || "Unnamed service", value: recordId(service) })),
            ]}
            value={serviceId}
            onChange={setServiceId}
            className="lg:w-[180px]"
          />
          <FilterSelect
            placeholder="All Companies"
            options={[
              { label: "All Companies", value: ALL_VALUE },
              ...companies
                .filter((company) => recordId(company))
                .map((company) => ({ label: company.name || company.companyName || company.businessName || "Unnamed company", value: recordId(company) })),
            ]}
            value={companyId}
            onChange={setCompanyId}
            className="lg:w-[180px]"
          />
          <Input aria-label="Filter by customer" placeholder="Customer name or phone" value={customer} onChange={(event) => setCustomer(event.target.value)} className="h-9 w-full bg-card lg:w-[180px]" />
          <Input aria-label="Filter by mechanic" placeholder="Mechanic name or business" value={mechanic} onChange={(event) => setMechanic(event.target.value)} className="h-9 w-full bg-card lg:w-[190px]" />
          <div className="flex items-center gap-1.5">
            <Input type="date" aria-label="Start date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-9 w-[150px] bg-card" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" aria-label="End date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-9 w-[150px] bg-card" />
          </div>
          <LocationFilterPopover value={location} onApply={setLocation} onClear={() => setLocation(null)} />
        </div>

        {!allowed ? (
          <div className="p-6">
            <EmptyState title="You don't have permission to view this page" description="Contact an administrator if you believe this is a mistake." />
          </div>
        ) : requestsQuery.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading service requests...
          </div>
        ) : requestsQuery.isError && !requestsQuery.data ? (
       
          <div className="flex flex-col items-start gap-3 p-6 text-sm font-semibold text-red-600 sm:flex-row sm:items-center">
            <AlertTriangle className="h-4 w-4" />
            {getErrorMessage(requestsQuery.error, "Unable to load service requests.")}
            <Button size="sm" variant="outline" onClick={() => void requestsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={hasActiveFilters ? "No service requests match the current filters." : "No service requests yet"}
              description={hasActiveFilters ? "Try a different search term or clear filters to see everything." : "Service requests will appear here as customers create them."}
            />
          </div>
        ) : (
          <AdminDataTable
            data={rows}
            columns={columns}
            minWidth="1440px"
            rowLabel="service requests"
            serverPagination={
              pagination
                ? {
                    page: pagination.page,
                    pages: pagination.pages,
                    total: pagination.total,
                    limit: pagination.limit,
                    onPageChange: setPage,
                  }
                : undefined
            }
          />
        )}
      </CardShell>
    </div>
  );
}
