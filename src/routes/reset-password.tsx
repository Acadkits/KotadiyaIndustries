import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password" }, { name: "robots", content: "noindex" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Only enable the form when we're in an actual recovery flow — not
    // whenever any session happens to exist. Supabase fires PASSWORD_RECOVERY
    // when the user opens the reset link on this device.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 12) {
      toast.error("Password must be at least 12 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Password updated. Please sign in with your new password.");
      navigate({ to: "/auth", replace: true });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <div className="w-full rounded-sm border border-border bg-card p-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-metallic">Set a new password</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {ready
            ? "Choose a new password (minimum 12 characters)."
            : "Open the password-reset link from your email on this device to continue."}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            required
            minLength={12}
            disabled={!ready}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
          />
          <input
            type="password"
            required
            minLength={12}
            disabled={!ready}
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !ready}
            className="w-full rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </section>
  );
}
