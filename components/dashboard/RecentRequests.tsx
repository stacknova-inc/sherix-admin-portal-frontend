import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardShell } from "@/components/shared/CardShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";


function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}

export function RecentRequests({ requests = [] }: { requests?: Array<{ id: string; name: string; location: string; status: string; time: string }> }) {
  return (
    <CardShell className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-black tracking-normal">Recent Requests</h2>
        <Link href="/dashboard/requests" className="text-xs font-bold text-primary hover:underline">View all</Link>
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-red-50 text-primary dark:bg-red-500/15">{initials(request.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{request.id} <span className="font-bold">{request.name}</span></p>
                  <p className="truncate text-xs text-muted-foreground">{request.location}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{request.time}</p>
            </div>
          </div>
        ))}
        {!requests.length && <EmptyState title="No recent requests" description="New requests will show up here as they come in." />}
      </div>
    </CardShell>
  );
}
