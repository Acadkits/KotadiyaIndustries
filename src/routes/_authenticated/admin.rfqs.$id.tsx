import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRfq, updateRfqStatus, signRfqFile } from "@/lib/admin.functions";
import { toast } from "sonner";
import { ArrowLeft, Download } from "lucide-react";
import { StatusPill } from "./admin.index";

const STATUSES = ["new", "contacted", "qualified", "quoted", "completed", "closed"] as const;

export const Route = createFileRoute("/_authenticated/admin/rfqs/$id")({
  head: () => ({ meta: [{ title: "RFQ Detail" }, { name: "robots", content: "noindex" }] }),
  component: RfqDetail,
});

function RfqDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "rfq", id], queryFn: () => getRfq({ data: { id } }) });

  const mut = useMutation({
    mutationFn: (status: string) => updateRfqStatus({ data: { id, status: status as any } }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "rfq", id] });
      qc.invalidateQueries({ queryKey: ["admin", "rfqs"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed"),
  });

  async function openFile(path: string) {
    try {
      const { url } = await signRfqFile({ data: { path } });
      window.open(url, "_blank", "noopener");
    } catch (e: any) {
      toast.error(e?.message || "Failed to open file");
    }
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data) return <div className="text-sm text-muted-foreground">Not found</div>;

  const files = Array.isArray(data.file_urls) ? (data.file_urls as any[]) : [];

  const field = (label: string, value: any) => (
    <div>
      <div className="mono-label text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );

  return (
    <div>
      <Link to="/admin/rfqs" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3 w-3" /> Back to RFQs
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-metallic">{data.company_name}</h1>
          <p className="text-sm text-muted-foreground">Received {new Date(data.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={data.status} />
          <select
            value={data.status}
            onChange={(e) => mut.mutate(e.target.value)}
            className="rounded-sm bg-card px-3 py-2 text-xs uppercase tracking-wider outline-none ring-1 ring-border"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-sm border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Contact</h2>
          <div className="space-y-3">
            {field("Full Name", data.full_name)}
            {field("Email", <a href={`mailto:${data.email}`} className="text-primary hover:underline">{data.email}</a>)}
            {field("Phone", <a href={`tel:${data.phone}`} className="text-primary hover:underline">{data.phone}</a>)}
            {field("Location", [data.city, data.state, data.country].filter(Boolean).join(", "))}
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Requirement</h2>
          <div className="space-y-3">
            {field("Type", data.requirement_type)}
            {field("Product", data.product_name)}
            {field("Material", data.material)}
            {field("Quantity", data.quantity)}
            {field("Expected delivery", data.expected_delivery_date)}
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-5 md:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold">Specifications & Notes</h2>
          <div className="space-y-3">
            {field("Specifications", <p className="whitespace-pre-wrap">{data.specifications}</p>)}
            {field("Additional notes", <p className="whitespace-pre-wrap">{data.additional_notes}</p>)}
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-5 md:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold">Attached Files ({files.length})</h2>
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files uploaded.</p>
          ) : (
            <ul className="divide-y divide-border">
              {files.map((f: any) => (
                <li key={f.path} className="flex items-center justify-between py-2">
                  <span className="text-sm">{f.name}</span>
                  <button
                    onClick={() => openFile(f.path)}
                    className="flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary"
                  >
                    <Download className="h-3 w-3" /> Open
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
