import { CheckCircle2 } from "lucide-react";
import { CardShell } from "@/components/shared/CardShell";
import { systemStatus } from "@/lib/mock-data";

export function SystemStatus() {
  return (
    <CardShell className="p-4 sm:p-5">
      <h2 className="mb-4 text-base font-black tracking-normal">System Status</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {systemStatus.map((item) => (
          <div key={item} className="rounded-xl border bg-background p-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              {item}
            </div>
            <p className="mt-2 text-xs font-bold text-green-600">Operational</p>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
