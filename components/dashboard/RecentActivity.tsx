import { CardShell } from "@/components/shared/CardShell";
import { recentActivity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function RecentActivity() {
  return (
    <CardShell className="p-4 sm:p-5">
      <h2 className="mb-4 text-base font-black tracking-normal">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.text} className="flex gap-3">
              <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", activity.bg, activity.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-5">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}
