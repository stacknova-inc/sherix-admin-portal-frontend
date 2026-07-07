import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { CardShell } from "@/components/shared/CardShell";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center">
      <CardShell className="p-6 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-red-50 text-primary dark:bg-red-500/10">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-black">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your role does not have access to this section.</p>
        <Button asChild className="mt-5">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </CardShell>
    </div>
  );
}

