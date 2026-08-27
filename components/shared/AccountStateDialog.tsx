"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function AccountStateDialog({ open, accountLabel, action, reason, onReasonChange, pending, onOpenChange, onConfirm }: {
  open: boolean;
  accountLabel: string;
  action: "activate" | "suspend";
  reason: string;
  onReasonChange: (value: string) => void;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const isSuspend = action === "suspend";
  const title = `${isSuspend ? "Suspend" : "Activate"} ${accountLabel}`;
  const description = isSuspend
    ? `${accountLabel} will lose access until an administrator activates the account again. An email notification will be sent to let them know.`
    : `${accountLabel} will regain access to the platform. An email notification will be sent to let them know.`;

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
      {isSuspend && <div className="space-y-2"><label htmlFor="account-state-reason" className="text-sm font-semibold">Suspension reason</label><Textarea id="account-state-reason" placeholder="Explain why this account is being suspended..." value={reason} onChange={(event) => onReasonChange(event.target.value)} /></div>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
        <Button onClick={onConfirm} disabled={pending || (isSuspend && !reason.trim())}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {pending ? "Processing..." : title}
        </Button>
      </div>
    </DialogContent>
  </Dialog>;
}
