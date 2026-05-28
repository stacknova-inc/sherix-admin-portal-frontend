import { CardShell } from "@/components/shared/CardShell";
import { topServices } from "@/lib/mock-data";

export function TopServices({ services = topServices }: { services?: Array<{ name: string; count: string; percent: number }> }) {
  return (
    <CardShell className="p-4 sm:p-5">
      <h2 className="mb-4 text-base font-black tracking-normal">Top Services</h2>
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.name}>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold">{service.name}</span>
              <span className="text-muted-foreground">{service.count} {service.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${service.percent}%` }} />
            </div>
          </div>
        ))}
        {!services.length && <p className="py-8 text-center text-sm font-semibold text-muted-foreground">No services available yet.</p>}
      </div>
    </CardShell>
  );
}
