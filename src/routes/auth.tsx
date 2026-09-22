import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { COMPANY } from "@/lib/company";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: `Sign in — ${COMPANY.name} Admin` }, { name: "robots", content: "noindex" }] }),
  validateSearch: searchSchema,
  component: AuthPage,
});

// Client-side throttle — reduces trivial brute-force from one machine.
// Real defense lives in Supabase Auth (rate limits + HIBP) and RLS.
const LS_KEY = "kt_auth_attempts";
function readAttempts(): { count: number; firstAt: number; lockedUntil: number } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { count: 0, firstAt: 0, lockedUntil: 0 };
    return JSON.parse(raw);
  } catch {
    return { count: 0, firstAt: 0, lockedUntil: 0 };
  }
}
function writeAttempts(v: { count: number; firstAt: number; lockedUntil: number }) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch {}
}

// Only redirect same-origin, same-app paths after login. Blocks open-redirect.
function safeRedirect(target: string | undefined): string {
  if (!target || typeof target !== "string") return "/admin";
  if (!target.startsWith("/") || target.startsWith("//")) return "/admin";
  return target;
}

function isSameHost(url: string) {
  try { return new URL(url).host === window.location.host; } catch { return false; }
}

function safeReturnTo(url: string | undefined) {
  if (!url) return "/admin";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (isSameHost(url)) return new URL(url).pathname + new URL(url).search;
  return "/admin";
}

function isInRecoveryFlow() {
  if (typeof window === "undefined") return false;
  return window.location.hash.includes("type=recovery");
}

export function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [signupAllowed, setSignupAllowed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  useEffect(() => {
    if (isInRecoveryFlow()) {
      navigate({ to: "/reset-password", replace: true });
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: safeReturnTo(search.redirect) as any });
    });
    // Signup is only allowed until the first admin claims — after that,
    // the sign-up form disappears entirely.
    supabase.rpc("any_admin_exists").then(({ data }) => setSignupAllowed(!data));
  }, []);

  useEffect(() => {
    const a = readAttempts();
    if (a.lockedUntil > Date.now()) {
      setLockRemaining(Math.ceil((a.lockedUntil - Date.now()) / 1000));
      const t = setInterval(() => {
        const rem = Math.ceil((readAttempts().lockedUntil - Date.now()) / 1000);
        if (rem <= 0) { setLockRemaining(0); clearInterval(t); }
        else setLockRemaining(rem);
      }, 1000);
      return () => clearInterval(t);
    }
  }, []);

  function registerFailure() {
    const now = Date.now();
    const a = readAttempts();
    const windowMs = 15 * 60 * 1000;
    const withinWindow = a.firstAt && now - a.firstAt < windowMs;
    const next = withinWindow
      ? { count: a.count + 1, firstAt: a.firstAt, lockedUntil: 0 }
      : { count: 1, firstAt: now, lockedUntil: 0 };
    if (next.count >= 5) {
      next.lockedUntil = now + 10 * 60 * 1000;
      setLockRemaining(600);
    }
    writeAttempts(next);
  }

  function registerSuccess() {
    writeAttempts({ count: 0, firstAt: 0, lockedUntil: 0 });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lockRemaining > 0) return;
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          registerFailure();
          throw new Error("Invalid email or password");
        }
        registerSuccess();
        // Bootstrap: first-ever sign-in becomes admin (no-op afterwards).
        try {
          const { claimFirstAdmin } = await import("@/lib/admin.functions");
          await claimFirstAdmin();
        } catch {}
        toast.success("Signed in");
        navigate({ to: safeReturnTo(search.redirect) as any });
      } else if (mode === "signup") {
        if (!signupAllowed) throw new Error("Sign-up is closed.");
        if (password.length < 12) throw new Error("Password must be at least 12 characters");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. Sign in to continue.");
        setMode("signin");
      } else {
        // Forgot password — always show a generic success (no email enumeration).
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        toast.success("If that email is registered, a reset link has been sent.");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const locked = lockRemaining > 0;

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <div className="w-full rounded-sm border border-border bg-card p-8">
        <div className="mono-label mb-4 text-primary">Admin Access</div>
        <h1 className="mb-2 font-display text-3xl font-bold text-metallic">
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create owner account" : "Reset password"}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {mode === "signup"
            ? "This creates the site owner. Only one owner account can be created."
            : "Restricted to Kotadiya Industries administrators."}
        </p>
        {locked && (
          <div className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Too many attempts. Try again in {Math.floor(lockRemaining / 60)}:
            {String(lockRemaining % 60).padStart(2, "0")}.
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mono-label mb-1 block text-xs">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm bg-background px-3 py-2 text-sm outline-none ring-1 ring-border"
            />
          </div>
          {mode !== "forgot" && (
            <div>
              <label className="mono-label mb-1 block text-xs">Password</label>
              <input
                type="password"
                required
                minLength={mode === "signup" ? 12 : 8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm bg-background px-3 py-2 text-sm outline-none ring-1 ring-border"
              />
              {mode === "signup" && (
                <p className="mt-1 text-[11px] text-muted-foreground">Minimum 12 characters. Leaked passwords are rejected.</p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={busy || locked}
            className="w-full rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </button>
        </form>
        <div className="mt-6 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
          {mode !== "signin" ? (
            <button className="underline" onClick={() => setMode("signin")}>Sign in</button>
          ) : (
            <button className="underline" onClick={() => setMode("forgot")}>Forgot password?</button>
          )}
          {signupAllowed && mode !== "signup" ? (
            <button className="underline" onClick={() => setMode("signup")}>Create owner account</button>
          ) : (
            <Link to="/" className="underline">Back to site</Link>
          )}
        </div>
      </div>
    </section>
  );
}
