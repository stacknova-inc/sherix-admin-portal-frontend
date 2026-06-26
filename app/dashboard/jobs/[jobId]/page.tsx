"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

function DetailGrid({ items }: { items: string[][] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs font-semibold text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-bold break-words">
            {value || "-"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function JobDetailsPage() {
  // Replace with your actual query later
  const booking = {
    id: "",
    requestId: "",
    service: "",
    customer: "",
    provider: "",
    location: "",
    amount: "",
    status: "",
    priority: "",
    paymentStatus: "",
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs / Requests
      </Link>

      <PageHeader
        title="Job Details"
        subtitle="View detailed information about a job request."
      />

      <CardShell className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black">
                {booking.service || "Job"}
              </h2>

              <StatusBadge
                status={booking.status || "Pending"}
              />
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Request ID: {booking.requestId || "-"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Priority
              </p>
              <p className="font-bold">
                {booking.priority || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Payment Status
              </p>
              <StatusBadge
                status={booking.paymentStatus || "Pending"}
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Amount
              </p>
              <p className="font-bold">
                {booking.amount || "-"}
              </p>
            </div>
          </div>
        </div>
      </CardShell>

      <CardShell className="p-4">
        <h2 className="mb-4 text-sm font-black">
          Job Information
        </h2>

        <DetailGrid
          items={[
            ["Job ID", booking.id],
            ["Request ID", booking.requestId],
            ["Service", booking.service],
            ["Customer", booking.customer],
            ["Provider", booking.provider],
            ["Location", booking.location],
            ["Status", booking.status],
            ["Priority", booking.priority],
            ["Payment Status", booking.paymentStatus],
            ["Amount", booking.amount],
          ]}
        />
      </CardShell>

      <CardShell className="p-4">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">
            Refresh Details
          </Button>
        </div>
      </CardShell>
    </div>
  );
}