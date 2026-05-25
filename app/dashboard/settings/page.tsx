"use client";

import { ChevronRight } from "lucide-react";
import { InitialAvatar, SoftTag } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { quickLinks, settingsSections, systemInformation } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function FieldBlock({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-b p-4 last:border-0 lg:grid-cols-[200px_minmax(0,1fr)]">
      <div>
        <h3 className="text-sm font-black">{title}</h3>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function LabelledInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-black">
      {label}
      <Input defaultValue={value} className="bg-card font-semibold" />
    </label>
  );
}

function LabelledSelect({ label, values }: { label: string; values: string[] }) {
  return (
    <label className="grid gap-1.5 text-xs font-black">
      {label}
      <Select defaultValue={values[0]}>
        <SelectTrigger className="h-9 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {values.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Settings" subtitle="Manage platform configuration and preferences." />

      <section className="grid gap-4 xl:grid-cols-[245px_minmax(0,1fr)] 2xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <CardShell className="p-3">
          <div className="space-y-1">
            {settingsSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.title}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg p-3 text-left transition-colors",
                    index === 0 ? "bg-red-50 text-primary dark:bg-red-500/10" : "hover:bg-muted",
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-black">{section.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{section.subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </CardShell>

        <CardShell>
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">General Settings</h2>
              <p className="mt-1.5 text-xs text-muted-foreground">Manage basic settings for the platform.</p>
            </div>
            <Button>Save Changes</Button>
          </div>

          <FieldBlock title="Site Information" subtitle="Update your platform name and domain.">
            <LabelledInput label="Platform Name" value="Sherix" />
            <LabelledInput label="Platform Domain" value="https://admin.sherix.com" />
          </FieldBlock>

          <FieldBlock title="Contact Information" subtitle="These details will be used for official communication.">
            <LabelledInput label="Support Email" value="support@sherix.com" />
            <LabelledInput label="Support Phone" value="+233 50 123 4567" />
          </FieldBlock>

          <FieldBlock title="Default Currency" subtitle="Set the default currency used across the platform.">
            <LabelledSelect label="Currency" values={["GHS - Ghana Cedi", "USD - US Dollar", "EUR - Euro"]} />
            <LabelledSelect label="Currency Position" values={["Before Amount (GHS 100.00)", "After Amount (100.00 GHS)"]} />
          </FieldBlock>

          <FieldBlock title="Timezone" subtitle="Set the default timezone for the platform.">
            <LabelledSelect label="Timezone" values={["(GMT+0:00) UTC", "(GMT+0:00) Accra", "(GMT+1:00) Lagos"]} />
          </FieldBlock>

          <FieldBlock title="Date Format" subtitle="Choose the default date format used in the system.">
            <LabelledSelect label="Date Format" values={["May 18, 2025 (MMM DD, YYYY)", "18/05/2025 (DD/MM/YYYY)"]} />
            <LabelledSelect label="Time Format" values={["12-Hour (hh:mm AM/PM)", "24-Hour (HH:mm)"]} />
          </FieldBlock>

          <FieldBlock title="Maintenance Mode" subtitle="Temporarily disable the platform for maintenance.">
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-black">Maintenance Mode</p>
              <div className="flex items-center gap-3">
                <button className="flex h-6 w-10 items-center rounded-full bg-slate-300 p-1 dark:bg-slate-700" aria-label="Maintenance mode off">
                  <span className="h-4 w-4 rounded-full bg-white shadow" />
                </button>
                <span className="text-xs text-muted-foreground">When enabled, users will see a maintenance page.</span>
              </div>
            </div>
          </FieldBlock>

          <FieldBlock title="Session Timeout" subtitle="Set the duration for admin session timeout.">
            <LabelledSelect label="Session Timeout" values={["30 Minutes", "1 Hour", "4 Hours"]} />
          </FieldBlock>
        </CardShell>

        <aside className="grid gap-4 xl:col-span-2 xl:grid-cols-3 2xl:col-span-1 2xl:block 2xl:space-y-5">
          <CardShell className="p-4">
            <h2 className="text-sm font-black">Quick Links</h2>
            <div className="mt-4 divide-y">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button key={link.title} className="flex w-full items-center gap-3 py-3 text-left">
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-lg",
                        link.tone === "green" && "bg-green-100 text-green-700 dark:bg-green-500/15",
                        link.tone === "amber" && "bg-amber-100 text-amber-700 dark:bg-amber-500/15",
                        link.tone === "blue" && "bg-blue-100 text-blue-700 dark:bg-blue-500/15",
                        link.tone === "purple" && "bg-purple-100 text-purple-700 dark:bg-purple-500/15",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black">{link.title}</span>
                      <span className="block text-xs text-muted-foreground">{link.subtitle}</span>
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </CardShell>

          <CardShell className="p-4">
            <h2 className="text-sm font-black">System Information</h2>
            <div className="mt-4 divide-y">
              {systemInformation.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-3 text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  {value === "Production" ? <SoftTag tone="green">{value}</SoftTag> : <span className="font-black">{value}</span>}
                </div>
              ))}
            </div>
          </CardShell>

          <CardShell className="p-4">
            <div className="flex items-center gap-3">
              <InitialAvatar initials="AD" className="bg-slate-900 text-white" />
              <div>
                <p className="text-sm font-black">Admin</p>
                <p className="text-xs text-muted-foreground">admin@sherix.com</p>
              </div>
            </div>
          </CardShell>
        </aside>
      </section>
    </div>
  );
}
