"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useForgotPassword } from "@/hooks/useAuth";

const successMessage = "If an account exists for this email, password reset instructions have been sent.";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await forgotPassword.mutateAsync({ email: email.trim() });
      setSubmitted(true);
    } catch {
      setError("We could not process your request right now. Please try again shortly.");
    }
  }

  return <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground sm:px-6">
    <div className="absolute right-5 top-5"><ThemeToggle /></div>
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-red-500/20"><ShieldCheck className="h-7 w-7" /></div>
        <h1 className="text-2xl font-black tracking-normal">SHERIX</h1>
        <p className="text-[10px] font-bold tracking-[0.24em] text-muted-foreground">ADMIN PORTAL</p>
      </div>
      <form onSubmit={onSubmit} className="rounded-xl border bg-card p-4 shadow-sherix sm:p-5">
        <div className="mb-5"><h2 className="text-xl font-bold tracking-normal">Reset your password</h2><p className="mt-1.5 text-xs text-muted-foreground">Enter your email and we&apos;ll send reset instructions if an account is available.</p></div>
        <label className="block text-xs font-semibold" htmlFor="email">Email
          <Input id="email" className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required disabled={forgotPassword.isPending || submitted} />
        </label>
        {submitted && <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" aria-live="polite">{successMessage}</p>}
        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" role="alert">{error}</p>}
        {!submitted && <Button className="mt-5 w-full" type="submit" disabled={forgotPassword.isPending}>{forgotPassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Send reset instructions</Button>}
        <Button className="mt-4 w-full" variant="ghost" asChild><Link href="/sign-in"><ArrowLeft className="h-4 w-4" />Back to sign in</Link></Button>
      </form>
    </div>
  </main>;
}