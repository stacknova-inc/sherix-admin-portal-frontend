import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-red-500/20">
        <ShieldCheck className="h-5 w-5" />
      </div>
      {!compact && (
        <div>
          <p className="text-lg font-black leading-none tracking-normal">SHERIX</p>
          <p className="mt-1 text-[9px] font-bold tracking-[0.2em] text-muted-foreground">ADMIN PORTAL</p>
        </div>
      )}
    </div>
  );
}
