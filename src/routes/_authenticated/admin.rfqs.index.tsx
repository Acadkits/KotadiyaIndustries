import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listRfqs } from "@/lib/admin.functions";
import { useMemo, useState, ChangeEvent } from "react";
import { StatusPill } from "./admin.index";
import { Download, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/rfqs/")({
  head: () => ({ meta: [{ title: "RFQs — Admin" }, { name: "robots", content: "noindex" }] }),
  component: RfqsPage,
});

function toCsv(rows: any[]) {
  if (!rows.length) return "";
  const cols = ["created_at", "company_name", "full_name", "email", "phone", "requirement_type", "product_name", "status"];
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function RfqsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "rfqs"], queryFn: () => listRfqs() });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const rows = useMemo(() => {
    const list = data ?? [];
    return list.filter((r: any) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return [r.full_name, r.company_name, r.email, r.phone, r.product_name].some((v) => (v ?? "").toLowerCase().includes(s));
    });
  }, [data, q, status]);

  function download() {
    const blob = new Blob([toCsv(rows)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rfqs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-metallic">RFQ Requests</h1>
        <button onClick={download} className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:border-primary">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[12.5rem]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} // Fixed implicit any
            placeholder="Search name, company, email…"
            className="w-full rounded-sm bg-card py-2 pl-9 pr-3 text-sm outline-none ring-1 ring-border"
          />
        </div>
        <select
          value={status}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)} // Fixed implicit any
          className="rounded-sm bg-card px-3 py-2 text-sm outline-none ring-1 ring-border"
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
              <th className="p-3">Company</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No RFQs match.</td></tr>}
            {rows.map((r: any) => (
              <tr key={r.id} className="hover:bg-background/40">
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <Link to="/admin/rfqs/\$id" params={{ id: r.id }} className="font-medium text-metallic hover:text-primary">
                    {r.company_name}
                  </Link>
                </td>
                <td className="p-3">
                  <div>{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </td>
                <td className="p-3 text-xs">{r.requirement_type}</td>
                <td className="p-3"><StatusPill status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
