"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function RejectReasonDialog({
  open,
  accountLabel,
  reason,
  onReasonChange,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  accountLabel: string;
  reason: string;
  onReasonChange: (value: string) => void;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {accountLabel}</DialogTitle>
          <DialogDescription>
            {accountLabel} will not be verified until this is resolved and resubmitted. An email notification with this reason will be sent to let them know.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="reject-reason" className="text-sm font-semibold">
            Rejection reason
          </label>
          <Textarea
            id="reject-reason"
            placeholder="Explain why this verification is being rejected..."
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending || !reason.trim()}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Processing..." : "Reject"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
