import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";
import { LayoutDashboard, FileText, MessageSquare, LogOut, Home, Package, FileEdit, Building2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/rfqs", label: "RFQs", icon: FileText },
  { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/content", label: "Site Content", icon: FileEdit },
  { to: "/admin/company", label: "Company Info", icon: Building2 },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon },
] as const;

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    try {
      const r = await checkIsAdmin();
      if (!r?.isAdmin) {
        await supabase.auth.signOut();
        throw redirect({ to: "/auth" });
      }
    } catch (e: any) {
      if (e?.isRedirect) throw e;
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const nav = NAV;

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-7xl grid-cols-1 gap-6 px-3 py-6 sm:px-4 sm:py-8 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="mono-label mb-3 text-primary md:mb-4">Admin</div>
        <nav className="-mx-3 flex flex-row gap-1 overflow-x-auto px-3 pb-2 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
          {nav.map((n) => {
            const active = n.to === "/admin" ? path === "/admin" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 text-sm transition md:shrink",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                {n.label}
              </Link>
            );
          })}
          <div className="flex shrink-0 flex-row gap-1 border-l border-border pl-1 md:mt-4 md:flex-col md:border-l-0 md:border-t md:pl-0 md:pt-2">
            <Link to="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4 shrink-0" /> View site
            </Link>
            <button
              onClick={signOut}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" /> Sign out
            </button>
          </div>
        </nav>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
