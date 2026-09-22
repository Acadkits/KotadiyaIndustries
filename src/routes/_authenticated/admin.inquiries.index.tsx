import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listInquiries } from "@/lib/admin.functions";
import { useMemo, useState } from "react";
import { StatusPill } from "./admin.index";
import { Download, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/inquiries/")({
  head: () => ({ meta: [{ title: "Inquiries — Admin" }, { name: "robots", content: "noindex" }] }),
  component: InquiriesPage,
});

function toCsv(rows: any[]) {
  if (!rows.length) return "";
  const cols = ["created_at", "full_name", "company_name", "email", "phone", "inquiry_type", "status", "message"];
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function InquiriesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "inquiries"], queryFn: () => listInquiries() });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const rows = useMemo(() => {
    const list = data ?? [];
    return list.filter((r: any) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return [r.full_name, r.company_name, r.email, r.phone, r.message].some((v) => (v ?? "").toLowerCase().includes(s));
    });
  }, [data, q, status]);

  function download() {
    const blob = new Blob([toCsv(rows)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-metallic">Inquiries</h1>
        <button onClick={download} className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:border-primary">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {["all", "new", "contacted", "qualified", "quoted", "completed", "closed"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Date</th>
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No inquiries match.</td></tr>}
            {rows.map((r: any) => (
              <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-background/40">
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <Link to="/admin/inquiries/$id" params={{ id: r.id }} className="font-medium text-metallic hover:text-primary">
                    {r.full_name}
                  </Link>
                  {r.company_name && <div className="text-xs text-muted-foreground">{r.company_name}</div>}
                </td>
                <td className="p-3">
                  <div className="text-xs">{r.email}</div>
                  {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
                </td>
                <td className="p-3 text-xs">{r.inquiry_type || "—"}</td>
                <td className="p-3"><StatusPill status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
