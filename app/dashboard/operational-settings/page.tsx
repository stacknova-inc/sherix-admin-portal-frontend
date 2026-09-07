"use client";

import * as React from "react";
import {
  AlertTriangle,
  Banknote,
  History,
  Loader2,
  MapPinned,
  Percent,
  PhoneCall,
  Save,
  Target,
  Timer,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { CardShell } from "@/components/shared/CardShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage, isApiConflict } from "@/lib/api";
import { asRecord, dateText, firstText, text } from "@/lib/live-data";
import { hasPermission, Permission } from "@/lib/rbac";
import { useUiStore } from "@/store/use-ui-store";
import { usePolicyConfig, usePolicyConfigHistory, useUpdatePolicyConfig } from "@/hooks/usePolicyConfig";
import type { PolicyConfig, PolicyConfigUpdateInput } from "@/types";

function FieldBlock({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-b p-4 last:border-0 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div>
        <h3 className="text-sm font-black">{title}</h3>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function LabelledField({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs font-black">
      {label}
      {children}
      {(error || hint) && <span className={error ? "font-semibold text-red-600" : "font-semibold text-muted-foreground"}>{error ?? hint}</span>}
    </label>
  );
}

function decimalInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("")}` : cleaned;
}

function integerInput(value: string) {
  return value.replace(/\D/g, "");
}


function GroupSectionShell({
  title,
  subtitle,
  isDirty,
  isPending,
  conflict,
  onSave,
  onDismissConflict,
  children,
}: {
  title: string;
  subtitle: string;
  isDirty: boolean;
  isPending: boolean;
  conflict?: string;
  onSave: (reason: string) => void;
  onDismissConflict: () => void;
  children: React.ReactNode;
}) {
  const [reasonOpen, setReasonOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");

  return (
    <CardShell>
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Button onClick={() => setReasonOpen(true)} disabled={!isDirty || isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
      {conflict && (
        <div className="m-4 flex items-start gap-3 rounded-xl border border-red-300/60 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p>{conflict}</p>
            <Button size="sm" variant="outline" className="mt-2 bg-card" onClick={onDismissConflict}>Reload latest configuration</Button>
          </div>
        </div>
      )}
      {children}
      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save {title}?</DialogTitle>
            <DialogDescription>This updates a platform-wide setting immediately. Provide a reason for the audit trail.</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for this change" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonOpen(false)} disabled={isPending}>Cancel</Button>
            <Button
              onClick={() => {
                onSave(reason.trim());
                setReasonOpen(false);
                setReason("");
              }}
              disabled={!reason.trim() || isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardShell>
  );
}

function useGroupSave<TGroup extends object>(groupKey: keyof PolicyConfig, current?: PolicyConfig) {
  const updatePolicy = useUpdatePolicyConfig();
  const [conflict, setConflict] = React.useState<string | undefined>();

  async function save(group: TGroup, reason: string) {
    setConflict(undefined);
    try {
      const payload = { [groupKey]: group, expectedVersion: current?.version ?? 0, reason } as unknown as PolicyConfigUpdateInput;
      await updatePolicy.mutateAsync(payload);
    } catch (error) {
      if (isApiConflict(error)) {
        setConflict("This configuration was changed by another administrator since this page loaded. Reload the latest configuration before retrying.");
        return;
      }
      throw error;
    }
  }

  return { save, isPending: updatePolicy.isPending, conflict, clearConflict: () => setConflict(undefined) };
}

function CallOutTab({ policy }: { policy: PolicyConfig }) {
  const source = policy.callOut ?? {};
  const [form, setForm] = React.useState(source);
  React.useEffect(() => setForm(source), [policy.version]);
  const { save, isPending, conflict, clearConflict } = useGroupSave("callOut", policy);
  const isDirty = JSON.stringify(form) !== JSON.stringify(source);

  const expiryError = form.expiryMinutes !== undefined && Number(form.expiryMinutes) <= 0 ? "Must be greater than 0." : undefined;
  const radiusError = form.searchRadiusKm !== undefined && Number(form.searchRadiusKm) <= 0 ? "Must be greater than 0." : undefined;

  return (
    <GroupSectionShell
      title="Call-Out Policy"
      subtitle="Job broadcast, expiration, escalation, ETA and SMS behaviour."
      isDirty={isDirty}
      isPending={isPending}
      conflict={conflict}
      onDismissConflict={clearConflict}
      onSave={(reason) => void save(form, reason)}
    >
      <FieldBlock title="Offer Expiry" subtitle="How long a call-out offer stays open before moving on.">
        <LabelledField label="Expiry (minutes)" error={expiryError}>
          <Input value={form.expiryMinutes ?? ""} onChange={(event) => setForm({ ...form, expiryMinutes: Number(integerInput(event.target.value)) })} inputMode="numeric" />
        </LabelledField>
        <LabelledField label="Max Concurrent Offers">
          <Input value={form.maxConcurrentOffers ?? ""} onChange={(event) => setForm({ ...form, maxConcurrentOffers: Number(integerInput(event.target.value)) })} inputMode="numeric" />
        </LabelledField>
      </FieldBlock>
      <FieldBlock title="Search & Escalation Radius" subtitle="Initial and expanded radius used to find a mechanic.">
        <LabelledField label="Search Radius (km)" error={radiusError}>
          <Input value={form.searchRadiusKm ?? ""} onChange={(event) => setForm({ ...form, searchRadiusKm: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
        <LabelledField label="Escalation Radius (km)">
          <Input value={form.escalationRadiusKm ?? ""} onChange={(event) => setForm({ ...form, escalationRadiusKm: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
        <LabelledField label="Escalation Enabled">
          <Select value={form.escalationEnabled ? "yes" : "no"} onValueChange={(value) => setForm({ ...form, escalationEnabled: value === "yes" })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Enabled</SelectItem><SelectItem value="no">Disabled</SelectItem></SelectContent>
          </Select>
        </LabelledField>
        <LabelledField label="Rebroadcast Enabled">
          <Select value={form.rebroadcastEnabled ? "yes" : "no"} onValueChange={(value) => setForm({ ...form, rebroadcastEnabled: value === "yes" })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Enabled</SelectItem><SelectItem value="no">Disabled</SelectItem></SelectContent>
          </Select>
        </LabelledField>
      </FieldBlock>
      <FieldBlock title="Arrival & ETA" subtitle="How arrival is detected and ETA is estimated.">
        <LabelledField label="Arrival Radius (meters)">
          <Input value={form.arrivalRadiusMeters ?? ""} onChange={(event) => setForm({ ...form, arrivalRadiusMeters: Number(integerInput(event.target.value)) })} inputMode="numeric" />
        </LabelledField>
        <LabelledField label="ETA Speed (km/h)">
          <Input value={form.etaSpeedKmh ?? ""} onChange={(event) => setForm({ ...form, etaSpeedKmh: Number(integerInput(event.target.value)) })} inputMode="numeric" />
        </LabelledField>
        <LabelledField label="SMS Notifications">
          <Select value={form.smsEnabled ? "yes" : "no"} onValueChange={(value) => setForm({ ...form, smsEnabled: value === "yes" })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Enabled</SelectItem><SelectItem value="no">Disabled</SelectItem></SelectContent>
          </Select>
        </LabelledField>
      </FieldBlock>
    </GroupSectionShell>
  );
}

function CustomerFeesTab({ policy }: { policy: PolicyConfig }) {
  const source = policy.customerFees ?? {};
  const [form, setForm] = React.useState(source);
  React.useEffect(() => setForm(source), [policy.version]);
  const { save, isPending, conflict, clearConflict } = useGroupSave("customerFees", policy);
  const isDirty = JSON.stringify(form) !== JSON.stringify(source);
  const percentError = form.serviceFeePercent !== undefined && (Number(form.serviceFeePercent) < 0 || Number(form.serviceFeePercent) > 100) ? "Must be between 0 and 100." : undefined;
  const rangeError = form.minFee !== undefined && form.maxFee !== undefined && Number(form.minFee) > Number(form.maxFee) ? "Minimum fee cannot exceed maximum fee." : undefined;

  return (
    <GroupSectionShell title="Customer Service Fees" subtitle="Fees charged to customers on top of the service price." isDirty={isDirty} isPending={isPending} conflict={conflict} onDismissConflict={clearConflict} onSave={(reason) => void save(form, reason)}>
      <FieldBlock title="Enable Fees" subtitle="Whether customer fees are applied at all.">
        <LabelledField label="Status">
          <Select value={form.enabled ? "enabled" : "disabled"} onValueChange={(value) => setForm({ ...form, enabled: value === "enabled" })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="enabled">Enabled</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent>
          </Select>
        </LabelledField>
      </FieldBlock>
      <FieldBlock title="Fee Amounts" subtitle="Flat booking fee and percentage-based service fee.">
        <LabelledField label="Booking Fee Amount">
          <Input value={form.bookingFeeAmount ?? ""} onChange={(event) => setForm({ ...form, bookingFeeAmount: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
        <LabelledField label="Service Fee (%)" error={percentError}>
          <Input value={form.serviceFeePercent ?? ""} onChange={(event) => setForm({ ...form, serviceFeePercent: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
      </FieldBlock>
      <FieldBlock title="Fee Caps" subtitle="Minimum and maximum fee that can be charged.">
        <LabelledField label="Minimum Fee" error={rangeError}>
          <Input value={form.minFee ?? ""} onChange={(event) => setForm({ ...form, minFee: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
        <LabelledField label="Maximum Fee">
          <Input value={form.maxFee ?? ""} onChange={(event) => setForm({ ...form, maxFee: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
      </FieldBlock>
    </GroupSectionShell>
  );
}

function GlobalCommissionTab({ policy }: { policy: PolicyConfig }) {
  const source = policy.commissions ?? {};
  const [form, setForm] = React.useState(source);
  React.useEffect(() => setForm(source), [policy.version]);
  const { save, isPending, conflict, clearConflict } = useGroupSave("commissions", policy);
  const isDirty = JSON.stringify(form) !== JSON.stringify(source);
  const mechanicError = form.mechanicServicePercent !== undefined && (Number(form.mechanicServicePercent) < 0 || Number(form.mechanicServicePercent) > 100) ? "Must be between 0 and 100." : undefined;
  const storeError = form.storeSalePercent !== undefined && (Number(form.storeSalePercent) < 0 || Number(form.storeSalePercent) > 100) ? "Must be between 0 and 100." : undefined;

  return (
    <GroupSectionShell title="Global Commission Defaults" subtitle="Platform-wide default commission rates. Per-service overrides live on the Commissions page." isDirty={isDirty} isPending={isPending} conflict={conflict} onDismissConflict={clearConflict} onSave={(reason) => void save(form, reason)}>
      <div className="p-4">
        <Link href="/dashboard/commissions" className="text-xs font-bold text-primary hover:underline">Manage per-service commission overrides →</Link>
      </div>
      <FieldBlock title="Default Commission Rates" subtitle="Applied to any service without its own custom commission.">
        <LabelledField label="Mechanic Service (%)" error={mechanicError}>
          <Input value={form.mechanicServicePercent ?? ""} onChange={(event) => setForm({ ...form, mechanicServicePercent: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
        <LabelledField label="Store Sale (%)" error={storeError}>
          <Input value={form.storeSalePercent ?? ""} onChange={(event) => setForm({ ...form, storeSalePercent: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
      </FieldBlock>
    </GroupSectionShell>
  );
}

function PayoutTab({ policy }: { policy: PolicyConfig }) {
  const source = policy.payout ?? {};
  const [form, setForm] = React.useState(source);
  React.useEffect(() => setForm(source), [policy.version]);
  const { save, isPending, conflict, clearConflict } = useGroupSave("payout", policy);
  const isDirty = JSON.stringify(form) !== JSON.stringify(source);
  const splits = form.splits ?? [];
  const splitTotal = splits.reduce((sum, split) => sum + Number(split.percent ?? 0), 0);
  const splitError = splits.length > 0 && splitTotal !== 100 ? `Splits must total 100% (currently ${splitTotal}%).` : undefined;

  function updateSplit(index: number, percent: number) {
    const next = splits.map((split, i) => (i === index ? { ...split, percent } : split));
    setForm({ ...form, splits: next });
  }

  return (
    <GroupSectionShell title="Payout & Settlement" subtitle="How and when providers are paid out." isDirty={isDirty} isPending={isPending} conflict={conflict} onDismissConflict={clearConflict} onSave={(reason) => void save(form, reason)}>
      <FieldBlock title="Settlement" subtitle="Whether automatic settlement runs, and how often.">
        <LabelledField label="Settlement Enabled">
          <Select value={form.settlementEnabled ? "yes" : "no"} onValueChange={(value) => setForm({ ...form, settlementEnabled: value === "yes" })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Enabled</SelectItem><SelectItem value="no">Disabled</SelectItem></SelectContent>
          </Select>
        </LabelledField>
        <LabelledField label="Settlement Period (days)">
          <Input value={form.settlementPeriodDays ?? ""} onChange={(event) => setForm({ ...form, settlementPeriodDays: Number(integerInput(event.target.value)) })} inputMode="numeric" />
        </LabelledField>
      </FieldBlock>
      <FieldBlock title="Minimum Payout" subtitle="Balance required before a payout is triggered.">
        <LabelledField label="Minimum Payout Amount">
          <Input value={form.minPayoutAmount ?? ""} onChange={(event) => setForm({ ...form, minPayoutAmount: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
      </FieldBlock>
      {splits.length > 0 && (
        <FieldBlock title="Payout Splits" subtitle="How each payout is divided. Must total 100%.">
          <div className="grid gap-2 md:col-span-2">
            {splits.map((split, index) => (
              <div key={`${split.entity}-${index}`} className="flex items-center gap-3">
                <span className="w-28 text-xs font-bold">{split.label ?? split.entity}</span>
                <Input value={split.percent ?? ""} onChange={(event) => updateSplit(index, Number(decimalInput(event.target.value)))} inputMode="decimal" className="h-8 w-24" />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            ))}
            {splitError && <span className="text-xs font-semibold text-red-600">{splitError}</span>}
          </div>
        </FieldBlock>
      )}
    </GroupSectionShell>
  );
}

function PaymentTab({ policy }: { policy: PolicyConfig }) {
  const source = policy.payment ?? {};
  const [form, setForm] = React.useState(source);
  React.useEffect(() => setForm(source), [policy.version]);
  const { save, isPending, conflict, clearConflict } = useGroupSave("payment", policy);
  const isDirty = JSON.stringify(form) !== JSON.stringify(source);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingCash, setPendingCash] = React.useState(Boolean(form.cashEnabled));

  function requestCashToggle(next: boolean) {
    setPendingCash(next);
    setConfirmOpen(true);
  }

  return (
    <>
      <GroupSectionShell title="Cash Payment Policy" subtitle="Which payment methods customers can use, platform-wide." isDirty={isDirty} isPending={isPending} conflict={conflict} onDismissConflict={clearConflict} onSave={(reason) => void save(form, reason)}>
        <FieldBlock title="Cash Payments" subtitle="When disabled, customers can only pay through the enabled digital methods below.">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => requestCashToggle(!form.cashEnabled)}
                className={`flex h-6 w-10 items-center rounded-full p-1 transition-colors ${form.cashEnabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"}`}
                aria-label={form.cashEnabled ? "Cash payments allowed" : "Cash payments disabled"}
              >
                <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${form.cashEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <span className="text-xs font-bold">{form.cashEnabled ? "Cash payments are allowed" : "Cash payments are disabled"}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">This is a platform-wide setting affecting every customer and provider, including requests already in progress.</p>
          </div>
        </FieldBlock>
        <FieldBlock title="Enabled Digital Methods" subtitle="Comma-separated payment gateway identifiers (e.g. paystack).">
          <div className="md:col-span-2">
            <Input
              value={(form.enabledMethods ?? []).join(", ")}
              onChange={(event) => setForm({ ...form, enabledMethods: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })}
              className="bg-card"
            />
          </div>
        </FieldBlock>
      </GroupSectionShell>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingCash ? "Enable" : "Disable"} cash payments platform-wide?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-left">
                <p>
                  Current value: <span className="font-bold text-foreground">{form.cashEnabled ? "Allowed" : "Disabled"}</span> — new value:{" "}
                  <span className="font-bold text-foreground">{pendingCash ? "Allowed" : "Disabled"}</span>.
                </p>
                <p>This applies to every customer and provider on the platform, including requests already in progress. Click "Save Changes" afterward to submit it with a reason.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={() => { setForm({ ...form, cashEnabled: pendingCash }); setConfirmOpen(false); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InvitationTab({ policy }: { policy: PolicyConfig }) {
  const source = policy.invitation ?? {};
  const [form, setForm] = React.useState(source);
  React.useEffect(() => setForm(source), [policy.version]);
  const { save, isPending, conflict, clearConflict } = useGroupSave("invitation", policy);
  const isDirty = JSON.stringify(form) !== JSON.stringify(source);
  const companyError = form.companyInvitationExpiryHours !== undefined && Number(form.companyInvitationExpiryHours) <= 0 ? "Must be greater than 0." : undefined;
  const mechanicError = form.mechanicInvitationExpiryHours !== undefined && Number(form.mechanicInvitationExpiryHours) <= 0 ? "Must be greater than 0." : undefined;

  return (
    <GroupSectionShell title="Invitations & Response Times" subtitle="How long invitation links remain valid." isDirty={isDirty} isPending={isPending} conflict={conflict} onDismissConflict={clearConflict} onSave={(reason) => void save(form, reason)}>
      <FieldBlock title="Invitation Expiry" subtitle="Hours before an invitation link expires.">
        <LabelledField label="Company Invitation (hours)" error={companyError}>
          <Input value={form.companyInvitationExpiryHours ?? ""} onChange={(event) => setForm({ ...form, companyInvitationExpiryHours: Number(integerInput(event.target.value)) })} inputMode="numeric" />
        </LabelledField>
        <LabelledField label="Mechanic Invitation (hours)" error={mechanicError}>
          <Input value={form.mechanicInvitationExpiryHours ?? ""} onChange={(event) => setForm({ ...form, mechanicInvitationExpiryHours: Number(integerInput(event.target.value)) })} inputMode="numeric" />
        </LabelledField>
      </FieldBlock>
    </GroupSectionShell>
  );
}

function AvailabilityTab({ policy }: { policy: PolicyConfig }) {
  const source = policy.availability ?? {};
  const [form, setForm] = React.useState(source);
  React.useEffect(() => setForm(source), [policy.version]);
  const { save, isPending, conflict, clearConflict } = useGroupSave("availability", policy);
  const isDirty = JSON.stringify(form) !== JSON.stringify(source);

  return (
    <GroupSectionShell title="Availability" subtitle="Default mechanic availability schedule." isDirty={isDirty} isPending={isPending} conflict={conflict} onDismissConflict={clearConflict} onSave={(reason) => void save(form, reason)}>
      <FieldBlock title="Enforcement" subtitle="Whether availability windows are enforced at all.">
        <LabelledField label="Enabled">
          <Select value={form.enabled ? "yes" : "no"} onValueChange={(value) => setForm({ ...form, enabled: value === "yes" })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Enabled</SelectItem><SelectItem value="no">Disabled</SelectItem></SelectContent>
          </Select>
        </LabelledField>
        <LabelledField label="Open 24 Hours">
          <Select value={form.open24Hours ? "yes" : "no"} onValueChange={(value) => setForm({ ...form, open24Hours: value === "yes" })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
          </Select>
        </LabelledField>
      </FieldBlock>
      {!form.open24Hours && (
        <FieldBlock title="Default Hours" subtitle="Used when a mechanic hasn't set their own schedule.">
          <LabelledField label="Default Open"><Input type="time" value={form.defaultOpen ?? ""} onChange={(event) => setForm({ ...form, defaultOpen: event.target.value })} className="bg-card" /></LabelledField>
          <LabelledField label="Default Close"><Input type="time" value={form.defaultClose ?? ""} onChange={(event) => setForm({ ...form, defaultClose: event.target.value })} className="bg-card" /></LabelledField>
        </FieldBlock>
      )}
      <FieldBlock title="Weekends" subtitle="Whether mechanics can be matched on weekends by default.">
        <LabelledField label="Allow Weekends">
          <Select value={form.allowWeekends ? "yes" : "no"} onValueChange={(value) => setForm({ ...form, allowWeekends: value === "yes" })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Allowed</SelectItem><SelectItem value="no">Not allowed</SelectItem></SelectContent>
          </Select>
        </LabelledField>
      </FieldBlock>
    </GroupSectionShell>
  );
}

function CoverageTab({ policy }: { policy: PolicyConfig }) {
  const source = policy.coverage ?? {};
  const [form, setForm] = React.useState(source);
  React.useEffect(() => setForm(source), [policy.version]);
  const { save, isPending, conflict, clearConflict } = useGroupSave("coverage", policy);
  const isDirty = JSON.stringify(form) !== JSON.stringify(source);
  const rangeError = form.defaultRadiusKm !== undefined && form.maxRadiusKm !== undefined && Number(form.defaultRadiusKm) > Number(form.maxRadiusKm) ? "Default radius cannot exceed maximum radius." : undefined;

  return (
    <GroupSectionShell title="Coverage" subtitle="Geographic service coverage radius." isDirty={isDirty} isPending={isPending} conflict={conflict} onDismissConflict={clearConflict} onSave={(reason) => void save(form, reason)}>
      <FieldBlock title="Enforcement" subtitle="Whether coverage radius is enforced.">
        <LabelledField label="Enabled">
          <Select value={form.enabled ? "yes" : "no"} onValueChange={(value) => setForm({ ...form, enabled: value === "yes" })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Enabled</SelectItem><SelectItem value="no">Disabled</SelectItem></SelectContent>
          </Select>
        </LabelledField>
      </FieldBlock>
      <FieldBlock title="Radius" subtitle="Default and maximum allowed coverage radius.">
        <LabelledField label="Default Radius (km)" error={rangeError}>
          <Input value={form.defaultRadiusKm ?? ""} onChange={(event) => setForm({ ...form, defaultRadiusKm: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
        <LabelledField label="Maximum Radius (km)">
          <Input value={form.maxRadiusKm ?? ""} onChange={(event) => setForm({ ...form, maxRadiusKm: Number(decimalInput(event.target.value)) })} inputMode="decimal" />
        </LabelledField>
      </FieldBlock>
    </GroupSectionShell>
  );
}

function MatchingTab({ policy }: { policy: PolicyConfig }) {
  const source = policy.matching ?? {};
  const [form, setForm] = React.useState(source);
  React.useEffect(() => setForm(source), [policy.version]);
  const { save, isPending, conflict, clearConflict } = useGroupSave("matching", policy);
  const isDirty = JSON.stringify(form) !== JSON.stringify(source);

  function toggle(key: keyof typeof form, value: boolean) {
    setForm({ ...form, [key]: value });
  }

  return (
    <GroupSectionShell title="Mechanic Matching" subtitle="Rules that decide which mechanics are offered a request." isDirty={isDirty} isPending={isPending} conflict={conflict} onDismissConflict={clearConflict} onSave={(reason) => void save(form, reason)}>
      <FieldBlock title="Matching Rules" subtitle="Requirements a mechanic must meet to be offered a request.">
        <LabelledField label="Match By Service">
          <Select value={form.matchByService ? "yes" : "no"} onValueChange={(value) => toggle("matchByService", value === "yes")}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Required</SelectItem><SelectItem value="no">Not required</SelectItem></SelectContent>
          </Select>
        </LabelledField>
        <LabelledField label="Require Online">
          <Select value={form.requireOnline ? "yes" : "no"} onValueChange={(value) => toggle("requireOnline", value === "yes")}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Required</SelectItem><SelectItem value="no">Not required</SelectItem></SelectContent>
          </Select>
        </LabelledField>
        <LabelledField label="Require Available">
          <Select value={form.requireAvailable ? "yes" : "no"} onValueChange={(value) => toggle("requireAvailable", value === "yes")}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Required</SelectItem><SelectItem value="no">Not required</SelectItem></SelectContent>
          </Select>
        </LabelledField>
        <LabelledField label="Require Zero Balance Due">
          <Select value={form.requireZeroBalanceDue ? "yes" : "no"} onValueChange={(value) => toggle("requireZeroBalanceDue", value === "yes")}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="yes">Required</SelectItem><SelectItem value="no">Not required</SelectItem></SelectContent>
          </Select>
        </LabelledField>
      </FieldBlock>
      <FieldBlock title="Broadcast" subtitle="How many mechanics are offered a request at once, and the sort order.">
        <LabelledField label="Max Broadcast Mechanics">
          <Input value={form.maxBroadcastMechanics ?? ""} onChange={(event) => setForm({ ...form, maxBroadcastMechanics: Number(integerInput(event.target.value)) })} inputMode="numeric" />
        </LabelledField>
        <LabelledField label="Sort By">
          <Select value={form.sortBy ?? "nearest"} onValueChange={(value) => setForm({ ...form, sortBy: value })}>
            <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="nearest">Nearest</SelectItem><SelectItem value="rating">Highest rated</SelectItem><SelectItem value="experience">Most experienced</SelectItem></SelectContent>
          </Select>
        </LabelledField>
      </FieldBlock>
    </GroupSectionShell>
  );
}

function HistoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const historyQuery = usePolicyConfigHistory();
  const entries = historyQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Policy Configuration History</DialogTitle>
          <DialogDescription>Previous versions of the platform policy configuration.</DialogDescription>
        </DialogHeader>
        {historyQuery.isLoading ? (
          <div className="flex items-center gap-2 p-4 text-sm font-semibold text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading history...</div>
        ) : historyQuery.isError ? (
          <div className="p-4 text-sm font-semibold text-red-600">{getErrorMessage(historyQuery.error, "Unable to load policy history.")}</div>
        ) : entries.length === 0 ? (
          <EmptyState title="No history yet" description="Changes to the policy configuration will appear here." />
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {entries.map((entry, index) => {
              const record = asRecord(entry);
              const changedBy = firstText(record, ["changedBy", "updatedBy", "adminName"], "Administrator");
              const reason = firstText(record, ["reason"], "No reason provided");
              const version = record.version !== undefined ? String(record.version) : "-";
              return (
                <div key={String(record._id ?? record.id ?? index)} className="rounded-xl border p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black">Version {version}</span>
                    <span className="text-xs text-muted-foreground">{dateText(text(record.createdAt ?? record.updatedAt, ""))}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">By {changedBy}</p>
                  <p className="mt-1 font-semibold">{reason}</p>
                </div>
              );
            })}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const tabs = [
  { value: "callout", label: "Call-Out Policy", icon: PhoneCall, Content: CallOutTab },
  { value: "fees", label: "Customer Fees", icon: Banknote, Content: CustomerFeesTab },
  { value: "commission", label: "Global Commission", icon: Percent, Content: GlobalCommissionTab },
  { value: "payout", label: "Payout & Settlement", icon: Wallet, Content: PayoutTab },
  { value: "payment", label: "Cash Payment", icon: Banknote, Content: PaymentTab },
  { value: "invitations", label: "Invitations & Response", icon: Timer, Content: InvitationTab },
  { value: "availability", label: "Availability", icon: MapPinned, Content: AvailabilityTab },
  { value: "coverage", label: "Coverage", icon: MapPinned, Content: CoverageTab },
  { value: "matching", label: "Mechanic Matching", icon: Target, Content: MatchingTab },
];

export default function OperationalSettingsPage() {
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const allowed = hasPermission(role, Permission.SERVICES);
  const policyQuery = usePolicyConfig();
  const [historyOpen, setHistoryOpen] = React.useState(false);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Operational Settings" subtitle="Marketplace-wide policy: call-outs, fees, commission defaults, payouts, payments, response times, availability and coverage." />
        <div className="flex gap-2">
          <Button variant="outline" className="bg-card" onClick={() => setHistoryOpen(true)} disabled={!allowed}>
            <History className="h-4 w-4" />
            Policy History
          </Button>
          <Button variant="outline" className="bg-card" asChild>
            <Link href="/dashboard/audit-logs">
              <History className="h-4 w-4" />
              Audit Logs
            </Link>
          </Button>
        </div>
      </div>

      {!allowed ? (
        <CardShell className="p-6"><EmptyState title="You don't have permission to view this page" description="Contact an administrator if you believe this is a mistake." /></CardShell>
      ) : policyQuery.isLoading ? (
        <CardShell className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading policy configuration...</CardShell>
      ) : policyQuery.isError ? (
        <CardShell className="flex flex-col items-start gap-3 p-6 text-sm font-semibold text-red-600 sm:flex-row sm:items-center">
          <AlertTriangle className="h-4 w-4" />
          {getErrorMessage(policyQuery.error, "Unable to load policy configuration.")}
          <Button size="sm" variant="outline" onClick={() => void policyQuery.refetch()}>Retry</Button>
        </CardShell>
      ) : (
        <Tabs defaultValue="callout" className="space-y-5">
          <div className="overflow-x-auto sherix-scrollbar">
            <TabsList className="h-auto min-w-max justify-start rounded-xl border bg-card p-1 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-2 px-4 py-2">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <tab.Content policy={policyQuery.data ?? {}} />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}
