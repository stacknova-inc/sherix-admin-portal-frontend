"use client";

import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function FieldBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 border-b p-4 last:border-0 lg:grid-cols-[200px_minmax(0,1fr)]">
      <div>
        <h3 className="text-sm font-black">{title}</h3>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          {subtitle}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function LabelledInput({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-black">
      {label}
      <Input defaultValue={value} className="bg-card font-semibold" />
    </label>
  );
}

function LabelledSelect({
  label,
}: {
  label: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-black">
      {label}
      <Select>
        <SelectTrigger className="h-9 bg-card">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="placeholder" disabled>
            Select an option
          </SelectItem>
        </SelectContent>
      </Select>
    </label>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Manage platform configuration and preferences."
      />

      <section className="grid gap-4 xl:grid-cols-[245px_minmax(0,1fr)] 2xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <CardShell className="p-3">
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              No settings sections available.
            </p>
          </div>
        </CardShell>

        <CardShell>
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">General Settings</h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Manage basic settings for the platform.
              </p>
            </div>
            <Button>Save Changes</Button>
          </div>

          <FieldBlock
            title="Site Information"
            subtitle="Update your platform name and domain."
          >
            <LabelledInput label="Platform Name" value="" />
            <LabelledInput label="Platform Domain" value="" />
          </FieldBlock>

          <FieldBlock
            title="Contact Information"
            subtitle="These details will be used for official communication."
          >
            <LabelledInput label="Support Email" value="" />
            <LabelledInput label="Support Phone" value="" />
          </FieldBlock>

          <FieldBlock
            title="Default Currency"
            subtitle="Set the default currency used across the platform."
          >
            <LabelledSelect label="Currency" />
            <LabelledSelect label="Currency Position" />
          </FieldBlock>

          <FieldBlock
            title="Timezone"
            subtitle="Set the default timezone for the platform."
          >
            <LabelledSelect label="Timezone" />
          </FieldBlock>

          <FieldBlock
            title="Date Format"
            subtitle="Choose the default date format used in the system."
          >
            <LabelledSelect label="Date Format" />
            <LabelledSelect label="Time Format" />
          </FieldBlock>

          <FieldBlock
            title="Maintenance Mode"
            subtitle="Temporarily disable the platform for maintenance."
          >
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-black">Maintenance Mode</p>
              <div className="flex items-center gap-3">
                <button
                  className="flex h-6 w-10 items-center rounded-full bg-slate-300 p-1 dark:bg-slate-700"
                  aria-label="Maintenance mode off"
                >
                  <span className="h-4 w-4 rounded-full bg-white shadow" />
                </button>
                <span className="text-xs text-muted-foreground">
                  When enabled, users will see a maintenance page.
                </span>
              </div>
            </div>
          </FieldBlock>

          <FieldBlock
            title="Session Timeout"
            subtitle="Set the duration for admin session timeout."
          >
            <LabelledSelect label="Session Timeout" />
          </FieldBlock>
        </CardShell>
      </section>
    </div>
  );
}