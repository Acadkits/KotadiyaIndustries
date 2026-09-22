import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompanyAdmin, saveCompanyDraft, publishCompany } from "@/lib/cms.functions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Send } from "lucide-react";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/_authenticated/admin/company")({
  head: () => ({ meta: [{ title: "Admin — Company Info" }, { name: "robots", content: "noindex" }] }),
  component: CompanyAdmin,
});

type Draft = {
  name?: string; tagline?: string; contactPerson?: string;
  phone?: string; phoneDigits?: string; email?: string;
  website?: string; address?: string; hours?: string;
};

function CompanyAdmin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "company"], queryFn: () => getCompanyAdmin() });
  const [draft, setDraft] = useState<Draft>({});

  useEffect(() => {
    if (q.data) {
      const d = (q.data as any).draft ?? {};
      const defaults: Draft = {
        name: COMPANY.name, tagline: COMPANY.tagline, contactPerson: COMPANY.contactPerson,
        phone: COMPANY.phone, phoneDigits: COMPANY.phoneDigits, email: COMPANY.email,
        website: COMPANY.website,
      };
      setDraft({ ...defaults, ...d });
    }
  }, [q.data]);

  const mSave = useMutation({
    mutationFn: () => saveCompanyDraft({ data: { draft } }),
    onSuccess: () => { toast.success("Draft saved"); qc.invalidateQueries({ queryKey: ["admin", "company"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="text-muted-foreground">Loading…</div>;
  const published = (q.data as any)?.published;
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(published ?? {});

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-metallic sm:text-3xl">Company Info</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => mSave.mutate()} disabled={mSave.isPending} className="inline-flex items-center gap-1.5 rounded-sm border border-primary px-3 py-2 text-sm text-primary hover:bg-primary/10">
            <Save className="h-4 w-4" /> Save draft
          </button>
          <button
            onClick={async () => { await mSave.mutateAsync(); await publishCompany(); toast.success("Published"); q.refetch(); qc.invalidateQueries({ queryKey: ["site"] }); }}
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Send className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>

      {!published && <div className="mb-4 rounded-sm bg-yellow-500/10 p-3 text-sm text-yellow-500">Not yet published — visitors still see built-in defaults.</div>}
      {hasChanges && published && <div className="mb-4 rounded-sm bg-blue-500/10 p-3 text-sm text-blue-400">Unpublished changes.</div>}

      <div className="space-y-4 rounded-sm border border-border bg-card p-6">
        <Row label="Company name"><input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} /></Row>
        <Row label="Tagline"><input value={draft.tagline || ""} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} className={inputCls} /></Row>
        <Row label="Contact person"><input value={draft.contactPerson || ""} onChange={(e) => setDraft({ ...draft, contactPerson: e.target.value })} className={inputCls} /></Row>
        <Row label="Phone (display)"><input value={draft.phone || ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={inputCls} placeholder="+91 6351588010" /></Row>
        <Row label="WhatsApp digits (no +)"><input value={draft.phoneDigits || ""} onChange={(e) => setDraft({ ...draft, phoneDigits: e.target.value.replace(/\D/g, "") })} className={inputCls} placeholder="916351588010" /></Row>
        <Row label="Email"><input type="email" value={draft.email || ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={inputCls} /></Row>
        <Row label="Website"><input value={draft.website || ""} onChange={(e) => setDraft({ ...draft, website: e.target.value })} className={inputCls} /></Row>
        <Row label="Address"><textarea rows={3} value={draft.address || ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} className={inputCls} /></Row>
        <Row label="Business hours"><input value={draft.hours || ""} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} className={inputCls} placeholder="Mon–Sat, 9:00 – 18:00 IST" /></Row>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm";
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="mono-label mb-2 text-primary">{label}</div>{children}</div>;
}
