"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { CardShell } from "@/components/shared/CardShell";
import { StatusCell } from "@/components/shared/AdminPrimitives";
import { useUser } from "@/hooks/useUsers";
import { activeStatus, asRecord, dateText, firstText } from "@/lib/live-data";
import { ArrowLeft } from "lucide-react";

export default function UserDetailsPage() {
  const params = useParams<{ userId: string }>();
  const userQuery = useUser(params.userId);
  const user = userQuery.data;
  const record = asRecord(user);
  const name = firstText(record, ["name", "fullName"], `${firstText(record, ["firstName"], "")} ${firstText(record, ["lastName"], "")}`.trim() || "User details");

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <span className="text-[#e2030f] hover:underline cursor-pointer flex items-center " onClick={() => window.history.back()}>
     <ArrowLeft className="inline-block mr-2 h-4 w-4" />
        Back
      </span>
      <PageHeader title={name} subtitle="User profile and account details from the backend." />
      <CardShell className="p-5">
        {userQuery.isLoading ? (
          <p className="text-sm font-semibold text-muted-foreground">Loading user details...</p>
        ) : userQuery.isError || !user ? (
          <p className="text-sm font-semibold text-red-600">Unable to load user details.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Email", firstText(record, ["email"])],
              ["Phone", firstText(record, ["phone", "phoneNumber"])],
              ["User Type", firstText(record, ["type", "userType", "role"], "Customer")],
              ["Joined", dateText(user.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <p className="mt-2 font-black">{value}</p>
              </div>
            ))}
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusCell status={activeStatus(record)} />
              </div>
            </div>
          </div>
        )}
      </CardShell>
    </div>
  );
}
