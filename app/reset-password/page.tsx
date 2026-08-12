"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useResetPassword } from "@/hooks/useAuth";

const MIN_PASSWORD_LENGTH = 8;

function resetErrorMessage(error: unknown) {
  if (error instanceof AxiosError && [400, 401, 403, 404, 410].includes(error.response?.status ?? 0)) {
    return "This password reset link is invalid, expired, or has already been used. Request a new link to continue.";
  }
  return "Unable to reset your password right now. Please try again or request a new link.";
}

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const resetPassword = useResetPassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const redirectTimer = window.setTimeout(() => router.replace("/sign-in"), 2000);
    return () => window.clearTimeout(redirectTimer);
  }, [router, success]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!token) return setError("This password reset link is invalid or incomplete. Request a new link to continue.");
    if (newPassword.length < MIN_PASSWORD_LENGTH) return setError(`Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    if (newPassword !== confirmPassword) return setError("The password confirmation does not match.");
    try {
      await resetPassword.mutateAsync({ token, new_password: newPassword, confirm_new_password: confirmPassword });
      setSuccess(true);
    } catch (resetError) {
      setError(resetErrorMessage(resetError));
    }
  }

  return <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground sm:px-6">
    <div className="absolute right-5 top-5"><ThemeToggle /></div>
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center text-center"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-red-500/20"><ShieldCheck className="h-7 w-7" /></div><h1 className="text-2xl font-black tracking-normal">SHERIX</h1><p className="text-[10px] font-bold tracking-[0.24em] text-muted-foreground">ADMIN PORTAL</p></div>
      <form onSubmit={onSubmit} className="rounded-xl border bg-card p-4 shadow-sherix sm:p-5">
        <div className="mb-5"><h2 className="text-xl font-bold tracking-normal">Choose a new password</h2><p className="mt-1.5 text-xs text-muted-foreground">Your new password must contain at least {MIN_PASSWORD_LENGTH} characters.</p></div>
        <div className="space-y-3">
          <label className="block text-xs font-semibold" htmlFor="new-password">New password<Input id="new-password" className="mt-2" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required disabled={resetPassword.isPending || success} /></label>
          <label className="block text-xs font-semibold" htmlFor="confirm-password">Confirm new password<Input id="confirm-password" className="mt-2" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required disabled={resetPassword.isPending || success} /></label>
        </div>
        {success && <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" aria-live="polite">Your password has been reset. Redirecting you to sign in.</p>}
        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" role="alert">{error}</p>}
        {!success && <Button className="mt-5 w-full" type="submit" disabled={resetPassword.isPending}>{resetPassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Reset password</Button>}
        <Button className="mt-4 w-full" variant="ghost" asChild><Link href="/sign-in"><ArrowLeft className="h-4 w-4" />Back to sign in</Link></Button>
        {error.includes("Request a new link") && (
          <Button className="mt-4 w-full" variant="outline" asChild><Link href="/forgot-password">Request a new reset link</Link></Button>
        )}
      </form>
    </div>
  </main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>;
}