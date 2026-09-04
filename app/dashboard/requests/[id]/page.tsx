"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Banknote,
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  ExternalLink,
  History,
  Images,
  Loader2,
  Lock,
  MapPin,
  Phone,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import { CardShell } from "@/components/shared/CardShell";
import { DataFreshness } from "@/components/shared/DataFreshness";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/api";
import { asRecord, dateText, firstText, formatStatusLabel, geoPointCoords, googleMapsUrl, money, timeText } from "@/lib/live-data";
import {
  buildLifecycleTimeline,
  isPopulatedReference,
  normalizePriceUpdate,
  partySummary,
  resolveCompany,
  resolveServiceName,
  serviceRequestDisplayId,
} from "@/lib/service-request-helpers";
import { hasPermission, Permission } from "@/lib/rbac";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useCompanies } from "@/hooks/useCompanies";
import { useServices } from "@/hooks/useServices";
import { serviceRequestDetailKey, useServiceRequestDetail } from "@/hooks/useServiceRequests";
import { useUiStore } from "@/store/use-ui-store";
import type { ServiceRequest } from "@/types";

const AUTO_REFRESH_MS = 45_000;

function Field({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold break-words">{value || "-"}</p>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <CardShell className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-black">{title}</h2>
      </div>
      {children}
    </CardShell>
  );
}

function PartyCard({ party, roleLabel }: { party: ReturnType<typeof partySummary>; roleLabel: string }) {
  const [photoFailed, setPhotoFailed] = React.useState(false);
  const hasPhoto = Boolean(party.photoUrl) && !photoFailed;

  return (
    <div className="flex items-center gap-4">
      {hasPhoto ? (
        <img src={party.photoUrl} alt={`${party.name} profile`} className="h-14 w-14 rounded-full object-cover" onError={() => setPhotoFailed(true)} />
      ) : (
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-muted">
          <UserRound className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-sm font-black">{party.name}</p>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
      </div>
    </div>
  );
}

function LifecycleNotice({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const copy: Record<string, { tone: string; icon: React.ComponentType<{ className?: string }>; text: string }> = {
    completed: {
      tone: "border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300",
      icon: Lock,
      text: "This service request is completed and treated as read-only. Modifying it would require a dedicated correction permission, which does not yet exist in the authorization system - see the Administrative Actions note below.",
    },
    cancelled: {
      tone: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
      icon: XCircle,
      text: "This service request was cancelled. It remains fully visible here for historical reference.",
    },
    expired: {
      tone: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
      icon: Clock3,
      text: "This service request expired before it was completed. It remains fully visible here for historical reference.",
    },
    disputed: {
      tone: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
      icon: AlertTriangle,
      text: "This service request is under dispute.",
    },
  };

  const entry = copy[normalized];
  if (!entry) return null;
  const Icon = entry.icon;

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 text-xs font-semibold ${entry.tone}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{entry.text}</span>
    </div>
  );
}

function AdministrativeActionsCard() {
  return (
    <CardShell className="border-dashed p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-black">Administrative actions are not available yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Assignment, reassignment, cancellation, administrative correction, and dispute-handling controls are intentionally not shown here. The backend currently exposes only{" "}
            <code className="rounded bg-muted px-1 py-0.5">GET /service-requests</code> and <code className="rounded bg-muted px-1 py-0.5">GET /service-requests/stats</code> for this
            resource, with no mutation endpoints.
          </p>
          <p className="mt-2 text-xs font-bold">
            BACKEND DEPENDENCY: POST/PATCH endpoints (and a matching permission for administrative correction) for assigning, reassigning, cancelling, correcting, and resolving disputes on a
            service request.
          </p>
        </div>
      </div>
    </CardShell>
  );
}

function CompanyGapNotice() {
  return (
    <div className="rounded-xl border border-dashed p-3 text-xs font-semibold text-muted-foreground">
      Company information is not available for this service request. The <code className="rounded bg-muted px-1 py-0.5">companyId</code> filter groups service requests by the mechanic&apos;s
      company, but this record does not include a resolvable company reference.
      <p className="mt-1 font-bold">BACKEND DEPENDENCY: a populated company object (or a companyId that matches an existing company record) on the service request response.</p>
    </div>
  );
}

export default function ServiceRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const role = useUiStore((state) => state.role ?? state.user?.role);
  const allowed = hasPermission(role, Permission.SERVICE_REQUESTS);

  const detailQuery = useServiceRequestDetail(allowed ? id : undefined);
  const servicesQuery = useServices();
  const companiesQuery = useCompanies();

  useAutoRefresh([serviceRequestDetailKey(id), ["serviceRequests", "stats"]], AUTO_REFRESH_MS, Boolean(allowed && id));

  const request = detailQuery.data;

  const backLink = (
    <Link href="/dashboard/requests" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary">
      <ArrowLeft className="h-4 w-4" />
      Back to Service Requests
    </Link>
  );

  if (!allowed) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-5">
        {backLink}
        <CardShell className="p-6">
          <EmptyState title="You don't have permission to view this page" description="Contact an administrator if you believe this is a mistake." />
        </CardShell>
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-5">
        {backLink}
        <CardShell className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading service request...
        </CardShell>
      </div>
    );
  }

  if (!request) {
   
    return (
      <div className="mx-auto max-w-[1200px] space-y-5">
        {backLink}
        <CardShell className="flex flex-col items-start gap-3 p-6 text-sm font-semibold text-red-600 sm:flex-row sm:items-center">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{getErrorMessage(detailQuery.error, "This service request could not be found.")}</span>
          <Button size="sm" variant="outline" onClick={() => void detailQuery.refetch()}>
            Retry
          </Button>
        </CardShell>
      </div>
    );
  }

  const isBackgroundRefreshing = detailQuery.isFetching && !detailQuery.isLoading;

  return (
    <ServiceRequestDetail
      request={request}
      services={servicesQuery.data ?? []}
      companies={companiesQuery.data ?? []}
      backLink={backLink}
      isBackgroundRefreshing={isBackgroundRefreshing}
      dataUpdatedAt={detailQuery.dataUpdatedAt}
      isRefreshError={detailQuery.isError}
      onRetry={() => void detailQuery.refetch()}
    />
  );
}

function ServiceRequestDetail({
  request,
  services,
  companies,
  backLink,
  isBackgroundRefreshing,
  dataUpdatedAt,
  isRefreshError,
  onRetry,
}: {
  request: ServiceRequest;
  services: { _id?: string; id?: string; name?: string; title?: string }[];
  companies: unknown[];
  backLink: React.ReactNode;
  isBackgroundRefreshing: boolean;
  dataUpdatedAt: number;
  isRefreshError: boolean;
  onRetry: () => void;
}) {
  const displayId = serviceRequestDisplayId(request);
  const status = request.status || "requested";
  const priority = formatStatusLabel(request.priority, "-");

  const customer = partySummary(request.customerId, request.customerName);

  const mechanic = partySummary(request.mechanicId);
  const mechanicHasData = isPopulatedReference(request.mechanicId);
  const mechanicRecord = asRecord(request.mechanicId);
  const mechanicRating = mechanicRecord.rating;
  const mechanicCompletedJobs = firstText(mechanicRecord, ["completedJobs", "completedJobsCount"], "");

  const company = resolveCompany(request.companyId, companies);

  const vehicle = asRecord(request.vehicleDetails);

  const serviceName = resolveServiceName(request.serviceId, services);

  const coords = geoPointCoords(request.customerLocation);

  const timeline = React.useMemo(() => buildLifecycleTimeline(request), [request]);
  const priceUpdates = React.useMemo(() => (request.priceUpdates ?? []).map((entry, index) => normalizePriceUpdate(entry, index)), [request]);

  const paymentRecord = asRecord(request.paymentId);
  const paymentReference = firstText(paymentRecord, ["_id", "id", "reference", "transactionId"], typeof request.paymentId === "string" ? request.paymentId : "-");
  const paymentProvider = firstText(paymentRecord, ["provider", "method", "channel"], "-");
  const paymentAmount = typeof paymentRecord.amount === "number" ? paymentRecord.amount : request.finalCost;

  const photos = (request.photos ?? []).map((photo) => (typeof photo === "string" ? { url: photo } : (photo as { url?: string; caption?: string })));

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {backLink}
        <div role="status">
          <DataFreshness isFetching={isBackgroundRefreshing} dataUpdatedAt={dataUpdatedAt} isRefreshError={isRefreshError} onRetry={onRetry} />
        </div>
      </div>

      <CardShell className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black">{serviceName !== "-" ? serviceName : "Service Request"}</h2>
              <StatusBadge status={status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Service Request ID: {displayId}</p>
            {request.jobId && request.jobId !== displayId && <p className="text-xs text-muted-foreground">Internal reference: {request.jobId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Priority" value={priority} />
            <Field label="Created" value={`${dateText(request.createdAt)} · ${timeText(request.createdAt)}`} />
            <Field label="Updated" value={`${dateText(request.updatedAt)} · ${timeText(request.updatedAt)}`} />
            <Field label="Payment" value={<StatusBadge status={request.paymentStatus || (request.isPaid ? "Paid" : "Unpaid")} />} />
          </div>
        </div>
      </CardShell>

      <LifecycleNotice status={status} />

      <Tabs defaultValue="customer" className="space-y-5">
        <div className="overflow-x-auto sherix-scrollbar">
          <TabsList className="h-auto min-w-max justify-start rounded-xl border bg-card p-1 shadow-sm">
            <TabsTrigger value="customer" className="gap-2 px-4 py-2"><UserRound className="h-4 w-4" />Customer</TabsTrigger>
            <TabsTrigger value="vehicle" className="gap-2 px-4 py-2"><Car className="h-4 w-4" />Vehicle</TabsTrigger>
            <TabsTrigger value="service" className="gap-2 px-4 py-2"><Wrench className="h-4 w-4" />Service</TabsTrigger>
            <TabsTrigger value="location" className="gap-2 px-4 py-2"><MapPin className="h-4 w-4" />Location</TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2 px-4 py-2"><Banknote className="h-4 w-4" />Pricing</TabsTrigger>
            <TabsTrigger value="payment" className="gap-2 px-4 py-2"><CheckCircle2 className="h-4 w-4" />Payment</TabsTrigger>
            <TabsTrigger value="photos" className="gap-2 px-4 py-2"><Images className="h-4 w-4" />Photos</TabsTrigger>
            <TabsTrigger value="assignment" className="gap-2 px-4 py-2"><Award className="h-4 w-4" />Assignment</TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2 px-4 py-2"><History className="h-4 w-4" />Timeline</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="customer">
          <SectionCard title="Customer" icon={UserRound}>
            <div className="space-y-4">
              <PartyCard party={customer} roleLabel="Customer" />
              <FieldGrid>
                <Field label="Phone" value={customer.phone} />
                <Field label="Business Name" value={customer.businessName || "-"} />
                <Field label="Address" value={request.customerAddress} className="sm:col-span-2 lg:col-span-3" />
              </FieldGrid>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="vehicle">
          <SectionCard title="Vehicle" icon={Car}>
            <FieldGrid>
              <Field label="Make" value={firstText(vehicle, ["make"], "-")} />
              <Field label="Model" value={firstText(vehicle, ["model"], "-")} />
              <Field label="Year" value={firstText(vehicle, ["year"], "-")} />
              <Field label="Color" value={firstText(vehicle, ["color"], "-")} />
              <Field label="Plate Number" value={firstText(vehicle, ["plateNumber", "plate", "licensePlate"], "-")} />
            </FieldGrid>
          </SectionCard>
        </TabsContent>

        <TabsContent value="service">
          <SectionCard title="Service" icon={Wrench}>
            <FieldGrid>
              <Field label="Service Type" value={serviceName} />
              <Field label="Reported Problem" value={request.originalIssueTitle} />
              <Field label="Diagnosed Problem" value={request.actualIssueTitle || "Not yet diagnosed"} />
            </FieldGrid>
            <div className="mt-4">
              <Field label="Reported Description" value={request.problemDescription} />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="location">
          <SectionCard title="Location" icon={MapPin}>
            <FieldGrid>
              <Field label="Address" value={request.customerAddress} className="sm:col-span-2 lg:col-span-3" />
              <Field label="Latitude" value={coords ? coords.latitude.toFixed(6) : "-"} />
              <Field label="Longitude" value={coords ? coords.longitude.toFixed(6) : "-"} />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Map</p>
                {coords ? (
                  <a
                    href={googleMapsUrl(coords.latitude, coords.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    View on Google Maps
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-bold">-</p>
                )}
              </div>
            </FieldGrid>
          </SectionCard>
        </TabsContent>

        <TabsContent value="pricing">
          <SectionCard title="Pricing / Quotations" icon={Banknote}>
            <FieldGrid>
              <Field label="Original Min Price" value={typeof request.originalIssueMinPrice === "number" ? money(request.originalIssueMinPrice) : "-"} />
              <Field label="Original Max Price" value={typeof request.originalIssueMaxPrice === "number" ? money(request.originalIssueMaxPrice) : "-"} />
              <Field label="Mechanic Suggested Price" value={typeof request.mechanicSuggestedPrice === "number" ? money(request.mechanicSuggestedPrice) : "-"} />
              <Field label="Final Cost" value={typeof request.finalCost === "number" ? money(request.finalCost) : "-"} />
              <Field label="Price Update Status" value={request.priceUpdateStatus ? <StatusBadge status={request.priceUpdateStatus} /> : "-"} />
            </FieldGrid>

            <div className="mt-5">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Price Revision History</p>
              {priceUpdates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No price revisions recorded.</p>
              ) : (
                <div className="space-y-2">
                  {priceUpdates.map((update) => (
                    <div key={update.key} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-3 text-sm">
                      <div>
                        <p className="font-bold">{update.amount !== null ? money(update.amount) : "Amount unavailable"}</p>
                        {update.note && <p className="text-xs text-muted-foreground">{update.note}</p>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {update.status && <StatusBadge status={update.status} />}
                        {update.timestamp && <span>{dateText(update.timestamp)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="payment">
          <SectionCard title="Payment" icon={CheckCircle2}>
            <FieldGrid>
              <Field label="Payment Status" value={<StatusBadge status={request.paymentStatus || (request.isPaid ? "Paid" : "Unpaid")} />} />
              <Field label="Paid" value={request.isPaid ? "Yes" : "No"} />
              <Field label="Amount" value={typeof paymentAmount === "number" ? money(paymentAmount) : "-"} />
              <Field label="Provider" value={paymentProvider} />
              <Field label="Payment Reference" value={paymentReference} />
              <Field label="Platform Fee" value={typeof request.platformFee === "number" ? money(request.platformFee) : "-"} />
              <Field label="Mechanic Earnings" value={typeof request.mechanicEarnings === "number" ? money(request.mechanicEarnings) : "-"} />
            </FieldGrid>
          </SectionCard>
        </TabsContent>

        <TabsContent value="photos">
          <SectionCard title="Photos" icon={Images}>
            {photos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photos were submitted for this service request.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo, index) =>
                  photo.url ? (
                    <a key={photo.url + index} href={photo.url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-xl border bg-muted">
                      <img src={photo.url} alt={photo.caption || `Service request photo ${index + 1}`} className="h-32 w-full object-cover transition group-hover:scale-105" />
                    </a>
                  ) : null,
                )}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="assignment">
          <div className="space-y-5">
            <SectionCard title="Assigned Mechanic" icon={Award}>
              {mechanicHasData || request.mechanicId ? (
                <div className="space-y-4">
                  <PartyCard party={mechanic} roleLabel="Mechanic" />
                  <FieldGrid>
                    <Field label="Phone" value={<span className="inline-flex items-center gap-1.5">{mechanic.phone !== "-" && <Phone className="h-3.5 w-3.5" />}{mechanic.phone}</span>} />
                    <Field label="Business / Company" value={mechanic.businessName || "-"} />
                    <Field label="Rating" value={typeof mechanicRating === "number" ? mechanicRating.toFixed(1) : "-"} />
                    <Field label="Completed Service Requests" value={mechanicCompletedJobs || "-"} />
                  </FieldGrid>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No mechanic has been assigned to this service request yet.</p>
              )}
            </SectionCard>

            <SectionCard title="Company" icon={Building2}>
              {company ? (
                <FieldGrid>
                  <Field label="Name" value={company.name} />
                  <Field label="Phone" value={company.phone} />
                  <Field label="Business Name" value={company.businessName || "-"} />
                </FieldGrid>
              ) : (
                <CompanyGapNotice />
              )}
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <SectionCard title="Lifecycle Timeline" icon={History}>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lifecycle history has been recorded for this service request yet.</p>
            ) : (
              <ol className="space-y-4 border-l-2 border-dashed pl-5">
                {timeline.map((event) => (
                  <li key={event.key} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black">{event.label}</span>
                      {event.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {dateText(event.timestamp)} · {timeText(event.timestamp)}
                        </span>
                      )}
                    </div>
                    {(event.previousState || event.newState) && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.previousState || "-"} → {event.newState || "-"}
                      </p>
                    )}
                    {event.description && <p className="mt-1 text-sm">{event.description}</p>}
                    {event.reason && <p className="mt-1 text-xs text-muted-foreground">Reason: {event.reason}</p>}
                    {event.actor && <p className="mt-1 text-xs text-muted-foreground">By: {event.actor}</p>}
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      <AdministrativeActionsCard />
    </div>
  );
}
