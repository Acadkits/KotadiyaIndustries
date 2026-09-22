import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Send, RotateCcw, Image as ImageIcon, X, Plus } from "lucide-react";
import {
  getProductAdmin,
  updateProductDraft,
  publishProduct,
  discardProductDraft,
} from "@/lib/cms.functions";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  head: () => ({ meta: [{ title: "Admin — Edit Product" }, { name: "robots", content: "noindex" }] }),
  component: ProductEdit,
});

type Draft = {
  name: string;
  blurb: string;
  applications: string[];
  imagePath: string | null;
  imagePosition: "top" | "bottom";
  specs: Record<string, string>;
};

function ProductEdit() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["admin", "products", id], queryFn: () => getProductAdmin({ data: { id } }) });

  const [draft, setDraft] = useState<Draft | null>(null);
  const [slug, setSlug] = useState("");
  const [hidden, setHidden] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (q.data) {
      const d = (q.data as any).draft ?? {};
      setDraft({
        name: d.name ?? "",
        blurb: d.blurb ?? "",
        applications: Array.isArray(d.applications) ? d.applications : [],
        imagePath: d.imagePath ?? null,
        imagePosition: d.imagePosition === "bottom" ? "bottom" : "top",
        specs: d.specs && typeof d.specs === "object" ? d.specs : {},
      });
      setSlug((q.data as any).slug);
      setHidden((q.data as any).is_hidden);
    }
  }, [q.data]);

  const mSave = useMutation({
    mutationFn: async () => {
      if (!draft) return;
      await updateProductDraft({ data: { id, draft, is_hidden: hidden, slug } });
    },
    onSuccess: () => {
      toast.success("Draft saved");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: any) => toast.error(e.message || "Save failed"),
    // note: publish handler below invalidates site queries too
  });

  if (q.isLoading || !draft) return <div className="text-muted-foreground">Loading…</div>;

  const imgUrl = draft.imagePath ? (q.data as any).urls?.[draft.imagePath] : null;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="mono-label mb-4 inline-flex items-center gap-2 text-muted-foreground! hover:text-primary!">
        <ArrowLeft className="h-3 w-3" /> All Products
      </Link>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-metallic sm:text-3xl">Edit Product</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              await mSave.mutateAsync();
              await discardProductDraft({ data: { id } });
              await q.refetch();
              toast.success("Reverted to published version");
            }}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" /> Discard
          </button>
          <button
            onClick={() => mSave.mutate()}
            disabled={mSave.isPending}
            className="inline-flex items-center gap-1.5 rounded-sm border border-primary px-3 py-2 text-sm text-primary hover:bg-primary/10"
          >
            <Save className="h-4 w-4" /> Save draft
          </button>
          <button
            onClick={async () => {
              await mSave.mutateAsync();
              await publishProduct({ data: { id } });
              toast.success("Published");
              qc.invalidateQueries({ queryKey: ["admin", "products"] });
              qc.invalidateQueries({ queryKey: ["site"] });
            }}
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Send className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>

      <div className="space-y-5 rounded-sm border border-border bg-card p-6">
        <Field label="Name">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        </Field>
        <Field label="Slug (URL)">
          <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm font-mono" />
        </Field>
        <Field label="Description">
          <textarea rows={4} value={draft.blurb} onChange={(e) => setDraft({ ...draft, blurb: e.target.value })} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        </Field>

        <Field label="Image">
          <div className="flex items-start gap-4">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
              {imgUrl ? <img src={imgUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><ImageIcon className="h-6 w-6" /></div>}
            </div>
            <div className="space-y-2">
              <button type="button" onClick={() => setPickerOpen(true)} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-muted">Choose image</button>
              {draft.imagePath && (
                <button type="button" onClick={() => setDraft({ ...draft, imagePath: null })} className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs text-muted-foreground hover:text-red-400">
                  <X className="h-3 w-3" /> Remove image
                </button>
              )}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Focus:</span>
                <select value={draft.imagePosition} onChange={(e) => setDraft({ ...draft, imagePosition: e.target.value as any })} className="rounded-sm border border-border bg-background px-2 py-1">
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>
          </div>
        </Field>

        <Field label="Applications (one per line)">
          <textarea
            rows={5}
            value={draft.applications.join("\n")}
            onChange={(e) => setDraft({ ...draft, applications: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 20) })}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Technical specs">
          <div className="space-y-2">
            {Object.entries(draft.specs).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <input
                  value={k}
                  onChange={(e) => {
                    const nk = e.target.value;
                    const specs = { ...draft.specs };
                    delete specs[k];
                    specs[nk] = v;
                    setDraft({ ...draft, specs });
                  }}
                  className="w-1/3 rounded-sm border border-border bg-background px-2 py-1 text-sm font-mono"
                  placeholder="Key"
                />
                <input
                  value={v}
                  onChange={(e) => setDraft({ ...draft, specs: { ...draft.specs, [k]: e.target.value } })}
                  className="flex-1 rounded-sm border border-border bg-background px-2 py-1 text-sm"
                  placeholder="Value"
                />
                <button onClick={() => { const specs = { ...draft.specs }; delete specs[k]; setDraft({ ...draft, specs }); }} className="rounded-sm p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={() => setDraft({ ...draft, specs: { ...draft.specs, [`spec_${Object.keys(draft.specs).length + 1}`]: "" } })} className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-xs hover:bg-muted"><Plus className="h-3 w-3" /> Add spec</button>
          </div>
        </Field>

        <Field label="Visibility">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
            Hide this product from the website
          </label>
        </Field>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(path: string) => {
          setDraft({ ...draft, imagePath: path });
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono-label mb-2 text-primary">{label}</div>
      {children}
    </div>
  );
}
