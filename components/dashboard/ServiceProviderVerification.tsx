import { CardShell } from "@/components/shared/CardShell";
import { verificationStats } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ServiceProviderVerification() {
  return (
    <CardShell className="p-4 sm:p-5">
      <h2 className="mb-4 text-base font-black tracking-normal">Service Provider Verification</h2>
      <div className="space-y-3">
        {verificationStats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={cn("grid h-8 w-8 place-items-center rounded-full", item.bg, item.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
              </div>
              <p className="text-base font-black">{item.value}</p>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}
