import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listRfqs, listInquiries } from "@/lib/admin.functions";
import { Link } from "@tanstack/react-router";
import { FileText, MessageSquare, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview" }, { name: "robots", content: "noindex" }] }),
  component: Overview,
});

function Overview() {
  const rfqs = useQuery({ queryKey: ["admin", "rfqs"], queryFn: () => listRfqs() });
  const inqs = useQuery({ queryKey: ["admin", "inquiries"], queryFn: () => listInquiries() });

  const stat = (label: string, count: number | undefined, to: string, Icon: any) => (
    <Link to={to} className="group rounded-sm border border-border bg-card p-6 transition hover:border-primary">
      <div className="flex items-center justify-between">
        <div className="mono-label text-xs text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3 font-display text-4xl font-bold text-metallic">{count ?? "—"}</div>
      <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 transition group-hover:opacity-100">
        View <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );

  const rfqNew = rfqs.data?.filter((r: any) => r.status === "new").length;
  const inqNew = inqs.data?.filter((r: any) => r.status === "new").length;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold text-metallic">Overview</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat("Total RFQs", rfqs.data?.length, "/admin/rfqs", FileText)}
        {stat("New RFQs", rfqNew, "/admin/rfqs", FileText)}
        {stat("Total Inquiries", inqs.data?.length, "/admin/inquiries", MessageSquare)}
        {stat("New Inquiries", inqNew, "/admin/inquiries", MessageSquare)}
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-display text-lg font-semibold">Latest RFQs</h2>
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          {(rfqs.data ?? []).slice(0, 5).map((r: any) => (
            <Link
              key={r.id}
              to="/admin/rfqs/$id"
              params={{ id: r.id }}
              className="flex items-center justify-between p-3 text-sm hover:bg-background/50"
            >
              <div>
                <div className="font-medium">{r.company_name} — {r.full_name}</div>
                <div className="text-xs text-muted-foreground">{r.requirement_type} • {new Date(r.created_at).toLocaleString()}</div>
              </div>
              <StatusPill status={r.status} />
            </Link>
          ))}
          {rfqs.data && rfqs.data.length === 0 && <div className="p-6 text-sm text-muted-foreground">No RFQs yet.</div>}
        </div>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-primary/15 text-primary border-primary/30",
    contacted: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    qualified: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    quoted: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    completed: "bg-green-500/10 text-green-400 border-green-500/30",
    closed: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`rounded-sm border px-2 py-0.5 text-xs uppercase tracking-wider ${colors[status] ?? colors.new}`}>
      {status}
    </span>
  );
}
