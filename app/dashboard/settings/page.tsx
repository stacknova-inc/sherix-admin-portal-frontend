"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";
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
import { getErrorMessage } from "@/lib/api";
import { useSettings, useUpdateGeneralSettings } from "@/hooks/useSettings";
import type { GeneralSettings, Settings } from "@/types";

const currencyOptions = ["GHS", "USD", "EUR", "GBP"];
const currencyPositionOptions = ["before", "after"];
const timezoneOptions = [
  "Africa/Accra",
  "UTC",
  "Atlantic/Reykjavik",
  "America/New_York",
  "Europe/London",
];
const dateFormatOptions = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
const timeFormatOptions = ["12h", "24h"];
const sessionTimeoutOptions = ["15m", "30m", "1h", "4h", "8h", "24h"];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstValue(...values: unknown[]) {
  return values.find(
    (value) => value !== null && value !== undefined && value !== "",
  );
}

function stringValue(fallback: string, ...values: unknown[]) {
  const value = values.find(
    (item) =>
      item !== null &&
      item !== undefined &&
      item !== "" &&
      typeof item !== "object",
  );
  return String(value ?? fallback);
}

function booleanValue(fallback: boolean, ...values: unknown[]) {
  const value = firstValue(...values);
  if (typeof value === "boolean") return value;
  if (typeof value === "string")
    return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  if (typeof value === "number") return value === 1;
  return fallback;
}

function initialGeneral(settings?: Settings): GeneralSettings {
  const root = asRecord(settings);
  const general = asRecord(
    root.general ?? root.generalSettings ?? root.settings,
  );
  const source = Object.keys(general).length ? general : root;

 
  const platform = asRecord(
    source.siteInfo ?? source.platform ?? source.site ?? source.app,
  );
  const contact = asRecord(
    source.contactInfo ??
      source.contact ??
      source.support ??
      source.contactInformation,
  );
  const localization = asRecord(
    source.localization ?? source.locale ?? source.regional,
  );
  const security = asRecord(
    source.system ?? source.security ?? source.session ?? source.auth,
  );

  return {
    platformName: stringValue(
      "",
      source.platformName,
      platform.platformName,
      platform.name,
      platform.siteName,
    ),
    platformDomain: stringValue(
      "",
      source.platformDomain,
      platform.platformDomain,
      platform.domain,
      platform.url,
      platform.siteUrl,
    ),
    supportEmail: stringValue(
      "",
      source.supportEmail,
      contact.supportEmail,
      contact.email,
    ),
    supportPhone: stringValue(
      "",
      source.supportPhone,
      contact.supportPhone,
      contact.phone,
      contact.phoneNumber,
    ),
    currency: stringValue("GHS", localization.defaultCurrency)
      .split(" - ")[0]
      .trim(),
    currencyPosition: stringValue(
      "before",
      localization.currencyPosition,
      source.currencyPosition,
    ),
    timezone: stringValue(
      "Africa/Accra",
      localization.timezone,
      localization.timeZone,
      source.timezone,
    ),
    dateFormat: stringValue(
      "MM/DD/YYYY",
      localization.dateFormat,
      source.dateFormat,
    ),
    timeFormat: stringValue("12h", localization.timeFormat, source.timeFormat),
    maintenanceMode: booleanValue(
      false,
      security.maintenanceMode,
      source.maintenanceMode,
      source.isMaintenanceMode,
    ),
    sessionTimeout: stringValue(
      "30m",
      security.sessionTimeout,
      source.sessionTimeout,
      security.timeout,
    ),
  };
}

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
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-black">
      {label}
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-card font-semibold"
      />
    </label>
  );
}

function optionsWithValue(values: string[], value: string) {
  return value && !values.includes(value) ? [value, ...values] : values;
}

function LabelledSelect({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-black">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 bg-card">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {optionsWithValue(values, value).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export default function SettingsPage() {
  const settingsQuery = useSettings();
  const updateGeneral = useUpdateGeneralSettings();
  const [form, setForm] = React.useState<GeneralSettings>(() =>
    initialGeneral(),
  );
  const [notice, setNotice] = React.useState("");

  React.useEffect(() => {
    if (settingsQuery.data) {
      console.log("[Settings] raw:", settingsQuery.data);
      console.log("[Settings] mapped:", initialGeneral(settingsQuery.data));
      setForm(initialGeneral(settingsQuery.data));
    }
  }, [settingsQuery.data]);

  function setField<K extends keyof GeneralSettings>(
    key: K,
    value: GeneralSettings[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  async function saveGeneral() {
    try {
      await updateGeneral.mutateAsync(form);
      setNotice("Settings saved successfully.");
    } catch (error) {
      setNotice(getErrorMessage(error, "Unable to save settings."));
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Manage platform configuration and preferences."
      />

      <section className="grid gap-4 xl:grid-cols-[245px_minmax(0,1fr)] 2xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <CardShell className="p-3">
          <div className="grid gap-2 text-sm font-semibold">
            <span className="rounded-md bg-muted px-3 py-2 text-foreground">
              General
            </span>
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
            <Button
              onClick={saveGeneral}
              disabled={settingsQuery.isLoading || updateGeneral.isPending}
            >
              {updateGeneral.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>

          {settingsQuery.isLoading ? (
            <div className="p-6 text-sm font-semibold text-muted-foreground">
              Loading settings...
            </div>
          ) : settingsQuery.isError ? (
            <div className="p-6 text-sm font-semibold text-red-600">
              {getErrorMessage(settingsQuery.error, "Unable to load settings.")}
            </div>
          ) : (
            <>
              {notice && (
                <div className="border-b p-4 text-sm font-semibold text-muted-foreground">
                  {notice}
                </div>
              )}

              <FieldBlock
                title="Site Information"
                subtitle="Update your platform name and domain."
              >
                <LabelledInput
                  label="Platform Name"
                  value={form.platformName ?? ""}
                  onChange={(value) => setField("platformName", value)}
                />
                <LabelledInput
                  label="Platform Domain"
                  value={form.platformDomain ?? ""}
                  onChange={(value) => setField("platformDomain", value)}
                />
              </FieldBlock>

              <FieldBlock
                title="Contact Information"
                subtitle="These details will be used for official communication."
              >
                <LabelledInput
                  label="Support Email"
                  value={form.supportEmail ?? ""}
                  onChange={(value) => setField("supportEmail", value)}
                />
                <LabelledInput
                  label="Support Phone"
                  value={form.supportPhone ?? ""}
                  onChange={(value) => setField("supportPhone", value)}
                />
              </FieldBlock>

              <FieldBlock
                title="Default Currency"
                subtitle="Set the default currency used across the platform."
              >
                <LabelledSelect
                  label="Currency"
                  value={form.currency ?? "GHS"}
                  values={currencyOptions}
                  onChange={(value) => setField("currency", value)}
                />
                <LabelledSelect
                  label="Currency Position"
                  value={form.currencyPosition ?? "before"}
                  values={currencyPositionOptions}
                  onChange={(value) => setField("currencyPosition", value)}
                />
              </FieldBlock>

              <FieldBlock
                title="Timezone"
                subtitle="Set the default timezone for the platform."
              >
                <LabelledSelect
                  label="Timezone"
                  value={form.timezone ?? "Africa/Accra"}
                  values={timezoneOptions}
                  onChange={(value) => setField("timezone", value)}
                />
              </FieldBlock>

              <FieldBlock
                title="Date Format"
                subtitle="Choose the default date format used in the system."
              >
                <LabelledSelect
                  label="Date Format"
                  value={form.dateFormat ?? "MM/DD/YYYY"}
                  values={dateFormatOptions}
                  onChange={(value) => setField("dateFormat", value)}
                />
                <LabelledSelect
                  label="Time Format"
                  value={form.timeFormat ?? "12h"}
                  values={timeFormatOptions}
                  onChange={(value) => setField("timeFormat", value)}
                />
              </FieldBlock>

              <FieldBlock
                title="Maintenance Mode"
                subtitle="Temporarily disable the platform for maintenance."
              >
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-black">Maintenance Mode</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setField("maintenanceMode", !form.maintenanceMode)
                      }
                      className={`flex h-6 w-10 items-center rounded-full p-1 transition-colors ${form.maintenanceMode ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"}`}
                      aria-label={
                        form.maintenanceMode
                          ? "Maintenance mode on"
                          : "Maintenance mode off"
                      }
                    >
                      <span
                        className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${form.maintenanceMode ? "translate-x-4" : "translate-x-0"}`}
                      />
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
                <LabelledSelect
                  label="Session Timeout"
                  value={form.sessionTimeout ?? "30m"}
                  values={sessionTimeoutOptions}
                  onChange={(value) => setField("sessionTimeout", value)}
                />
              </FieldBlock>
            </>
          )}
        </CardShell>
      </section>
    </div>
  );
}
