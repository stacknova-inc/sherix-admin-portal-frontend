"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useUiStore } from "@/store/use-ui-store";
import { getErrorMessage } from "@/lib/api";
import { getDefaultRoute } from "@/lib/rbac";

export default function SignInPage() {
  const router = useRouter();
  const login = useUiStore((state) => state.login);
  const isAuthenticating = useUiStore((state) => state.isAuthenticating);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const session = await login(email, password);
      router.replace(getDefaultRoute(session.role));
    } catch (loginError) {
      setError(getErrorMessage(loginError, "Unable to sign in"));
    }
  }

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
      <section className="relative hidden overflow-hidden bg-[#06111F] p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(227,6,19,0.34),transparent_34%),linear-gradient(140deg,rgba(227,6,19,0.2),transparent_45%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-red-950/40">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-black tracking-normal">SHERIX</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-white/55">
              ADMIN PORTAL
            </p>
          </div>
        </div>
        <div className="relative max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">
            Marketplace operations
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-normal">
            Control center for service delivery, payments, and trust.
          </h1>
          <p className="mt-5 text-sm leading-6 text-slate-300">
            Manage requests, providers, revenue, disputes, and platform health
            from a single polished admin workspace.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-3 text-xs text-slate-300">
          {["12,458 users", "3,892 jobs", "GHS 128k revenue"].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-red-500/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-normal">SHERIX</h1>
            <p className="text-[10px] font-bold tracking-[0.24em] text-muted-foreground">
              ADMIN PORTAL
            </p>
          </div>
          <form
            onSubmit={onSubmit}
            className="rounded-xl border bg-card p-4 shadow-sherix sm:p-5"
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-normal">Sign in</h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Enter your admin credentials to continue.
              </p>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold">
                Email
                <Input
                  className="mt-2"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="block text-xs font-semibold">
                Password
                <Input
                  className="mt-2"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
            </div>
            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border accent-[#E30613]"
                  defaultChecked
                />
                Remember me
              </label>
              <a
                href="#"
                className="font-semibold text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Button
              className="mt-5 w-full"
              type="submit"
              disabled={isAuthenticating}
            >
              {isAuthenticating && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
