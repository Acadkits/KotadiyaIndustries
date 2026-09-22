import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInquiry, updateInquiryStatus } from "@/lib/admin.functions";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { StatusPill } from "./admin.index";

const STATUSES = ["new", "contacted", "qualified", "quoted", "completed", "closed"] as const;

export const Route = createFileRoute("/_authenticated/admin/inquiries/$id")({
  head: () => ({ meta: [{ title: "Inquiry Detail" }, { name: "robots", content: "noindex" }] }),
  component: InquiryDetail,
});

function InquiryDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "inquiry", id], queryFn: () => getInquiry({ data: { id } }) });

  const mut = useMutation({
    mutationFn: (status: string) => updateInquiryStatus({ data: { id, status: status as any } }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "inquiry", id] });
      qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed"),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data) return <div className="text-sm text-muted-foreground">Not found</div>;

  const field = (label: string, value: any) => (
    <div>
      <div className="mono-label text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );

  return (
    <div>
      <Link to="/admin/inquiries" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3 w-3" /> Back to Inquiries
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-metallic">{data.full_name}</h1>
          <p className="text-sm text-muted-foreground">Received {new Date(data.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={data.status} />
          <select
            value={data.status}
            onChange={(e) => mut.mutate(e.target.value)}
            className="rounded-sm border border-border bg-card px-3 py-2 text-xs uppercase tracking-wider outline-none focus:border-primary"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-sm border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Contact</h2>
          <div className="space-y-3">
            {field("Company", data.company_name)}
            {field("Email", <a href={`mailto:${data.email}`} className="text-primary hover:underline">{data.email}</a>)}
            {field("Phone", data.phone && <a href={`tel:${data.phone}`} className="text-primary hover:underline">{data.phone}</a>)}
            {field("Inquiry type", data.inquiry_type)}
          </div>
        </section>
        <section className="rounded-sm border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Message</h2>
          <p className="whitespace-pre-wrap text-sm">{data.message}</p>
        </section>
      </div>
    </div>
  );
}
