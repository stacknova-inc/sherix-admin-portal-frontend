"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, MapPin, MoreVertical, Phone, RefreshCcw, UserRoundCheck, Users } from "lucide-react";
import { InitialAvatar, RatingStars, SoftTag } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { jobDetails } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function DetailGrid({ items }: { items: string[][] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className={cn("grid gap-1", value.length > 42 && "sm:col-span-2")}>
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="text-xs font-bold leading-5">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ContactCard({
  title,
  name,
  email,
  phone,
  initials,
  avatarTone,
  children,
}: {
  title: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  avatarTone: string;
  children?: React.ReactNode;
}) {
  return (
    <CardShell className="p-4">
      <h2 className="text-sm font-black">{title}</h2>
      <div className="mt-3 flex items-center gap-2.5">
        <InitialAvatar initials={initials} className={avatarTone} />
        <div className="min-w-0">
          <p className="truncate font-black">{name}</p>
          <Button variant="link" className="h-auto p-0 text-xs font-black">
            View Profile
          </Button>
        </div>
      </div>
      <div className="mt-3 space-y-3 text-xs">
        <p className="flex items-center gap-2.5">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {phone}
        </p>
        <p className="flex items-center gap-2.5">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {email}
        </p>
        {children}
      </div>
    </CardShell>
  );
}

export default function JobDetailsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs / Requests
      </Link>

      <PageHeader title="Job Details" subtitle="View and manage detailed job information." />

      <CardShell className="p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-green-100 text-green-700 dark:bg-green-500/15">
              <UserRoundCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black">{jobDetails.service}</h2>
                <StatusBadge status={jobDetails.status} />
              </div>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {jobDetails.id} <span className="mx-2">.</span> Created on {jobDetails.createdOn} <span className="mx-2">.</span> {jobDetails.createdTime}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-4 xl:min-w-[620px]">
            <div className="border-l pl-3">
              <p className="text-xs text-muted-foreground">Priority</p>
              <SoftTag tone="red">{jobDetails.priority}</SoftTag>
            </div>
            <div className="border-l pl-3">
              <p className="text-xs text-muted-foreground">Payment Status</p>
              <StatusBadge status={jobDetails.paymentStatus} />
            </div>
            <div className="border-l pl-3">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-lg font-black">{jobDetails.amount}</p>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardShell>

      <CardShell>
        <div className="sherix-scrollbar flex gap-5 overflow-x-auto border-b px-4 pt-4">
          {["Overview", "Timeline", "Service Provider", "Customer", "Location", "Payments", "Activity Log"].map((tab, index) => (
            <button
              key={tab}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 pb-3 text-xs font-black",
                index === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
              <CardShell className="p-4">
                <h2 className="mb-3 text-sm font-black">Job Information</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  <DetailGrid items={jobDetails.info} />
                  <DetailGrid items={jobDetails.meta} />
                </div>
              </CardShell>
              <CardShell className="p-4">
                <h2 className="mb-3 text-sm font-black">Job Description</h2>
                <p className="text-xs font-semibold leading-5 text-muted-foreground">{jobDetails.description}</p>
                <h3 className="mb-3 mt-6 text-sm font-black">Vehicle Details</h3>
                <DetailGrid items={jobDetails.vehicle} />
              </CardShell>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <ContactCard {...jobDetails.customer} title="Customer Information">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  {jobDetails.customer.address}
                </p>
              </ContactCard>

              <CardShell className="p-4">
                <h2 className="text-sm font-black">Location</h2>
                <div className="relative mt-3 h-36 overflow-hidden rounded-xl border bg-[linear-gradient(135deg,rgba(226,232,240,.9)_25%,transparent_25%),linear-gradient(225deg,rgba(226,232,240,.9)_25%,transparent_25%),linear-gradient(45deg,rgba(226,232,240,.9)_25%,transparent_25%),linear-gradient(315deg,rgba(226,232,240,.9)_25%,hsl(var(--muted))_25%)] bg-[length:34px_34px] bg-[position:17px_0,17px_0,0_0,0_0]">
                  <MapPin className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 fill-primary text-primary drop-shadow" />
                </div>
                <p className="mt-3 text-xs font-semibold leading-5">{jobDetails.customer.address}</p>
                <Button variant="outline" className="mt-3 bg-card">
                  View on Map
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardShell>

              <ContactCard {...jobDetails.provider} title="Service Provider">
                <div>
                  <RatingStars rating={jobDetails.provider.rating} />
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">{jobDetails.provider.id}</p>
                </div>
              </ContactCard>
            </div>
          </div>

          <aside className="space-y-5">
            <CardShell className="p-4">
              <h2 className="text-sm font-black">Job Status</h2>
              <div className="mt-4 space-y-4">
                {jobDetails.timeline.map((event, index) => (
                  <div key={event.label} className="relative flex gap-4">
                    {index < jobDetails.timeline.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-border" />}
                    <span
                      className={cn(
                        "relative mt-1 h-4 w-4 rounded-full border-4 border-card",
                        event.tone === "green" && "bg-green-600",
                        event.tone === "blue" && "bg-blue-600",
                        event.tone === "purple" && "bg-purple-600",
                        event.tone === "amber" && "bg-amber-500",
                      )}
                    />
                    <div>
                      <p className="text-xs font-black">{event.label}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardShell>

            <CardShell className="p-4">
              <h2 className="text-sm font-black">Payment Summary</h2>
              <div className="mt-4 space-y-3">
                {jobDetails.payment.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={cn("font-black", label === "Provider Payout" && "text-green-600")}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-3">
                  <StatusBadge status="Paid" />
                  <span className="text-xs text-muted-foreground">Paid on May 18, 2025 11:06 AM</span>
                </div>
              </div>
            </CardShell>

            <CardShell className="p-4">
              <h2 className="text-sm font-black">Actions</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Button variant="outline" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10">
                  <RefreshCcw className="h-4 w-4" />
                  Refund Payment
                </Button>
                <Button variant="outline" className="bg-card">
                  <Users className="h-4 w-4" />
                  Reassign Job
                </Button>
                <Button variant="outline" className="bg-card sm:col-span-2 xl:col-span-1">
                  <MoreVertical className="h-4 w-4" />
                  More Actions
                </Button>
              </div>
            </CardShell>
          </aside>
        </div>
      </CardShell>
    </div>
  );
}
