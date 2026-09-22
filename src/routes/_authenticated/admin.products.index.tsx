import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listProductsAdmin,
  publishProduct,
  discardProductDraft,
  deleteProduct,
  reorderProduct,
  createProduct,
} from "@/lib/cms.functions";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Send, Trash2, RotateCcw, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  head: () => ({ meta: [{ title: "Admin — Products" }, { name: "robots", content: "noindex" }] }),
  component: ProductsAdmin,
});

function ProductsAdmin() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["admin", "products"], queryFn: () => listProductsAdmin() });
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };

  const mCreate = useMutation({
    mutationFn: async () => {
      const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const r = await createProduct({
        data: {
          slug,
          draft: { name: newName.trim(), blurb: "", applications: [], imagePath: null, imagePosition: "top", specs: {} },
        },
      });
      return r.id;
    },
    onSuccess: (id) => {
      toast.success("Product created");
      setNewSlug("");
      setNewName("");
      nav({ to: "/admin/products/$id", params: { id } });
    },
    onError: (e: any) => toast.error(e.message || "Failed to create"),
  });

  const act = (fn: (id: string) => Promise<any>, ok: string) => async (id: string) => {
    try {
      await fn(id);
      toast.success(ok);
      invalidate();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-metallic">Products</h1>
      </div>

      <div className="mb-8 rounded-sm border border-border bg-card p-4">
        <div className="mono-label mb-3 text-primary">Add new product</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm"
            placeholder="Product name (e.g. Brass Bush)"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
            }}
          />
          <input
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm sm:w-56"
            placeholder="slug (url)"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
          />
          <button
            disabled={!newName.trim() || !newSlug.trim() || mCreate.isPending}
            onClick={() => mCreate.mutate()}
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Create
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {q.isLoading && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {q.data?.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No products yet.</td></tr>}
            {q.data?.map((p: any) => (
              <tr key={p.id} className="hover:bg-card/60">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.previewImage ? (
                      <img src={p.previewImage} alt="" loading="lazy" decoding="async" className="h-10 w-10 rounded-sm object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-sm bg-muted" />
                    )}
                    <div>
                      <div className="font-medium">{p.draft?.name || p.slug}</div>
                      <div className="text-xs text-muted-foreground">/products/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  {!p.published_at ? (
                    <span className="rounded-sm bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-500">Draft only</span>
                  ) : p.hasDraftChanges ? (
                    <span className="rounded-sm bg-blue-500/15 px-2 py-0.5 text-xs text-blue-400">Unpublished changes</span>
                  ) : (
                    <span className="rounded-sm bg-green-500/15 px-2 py-0.5 text-xs text-green-400">Published</span>
                  )}
                  {p.is_hidden && <span className="ml-2 rounded-sm bg-muted px-2 py-0.5 text-xs">Hidden</span>}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button title="Move up" onClick={() => reorderProduct({ data: { id: p.id, direction: "up" } }).then(invalidate)} className="rounded-sm p-1.5 hover:bg-muted"><ArrowUp className="h-4 w-4" /></button>
                    <button title="Move down" onClick={() => reorderProduct({ data: { id: p.id, direction: "down" } }).then(invalidate)} className="rounded-sm p-1.5 hover:bg-muted"><ArrowDown className="h-4 w-4" /></button>
                    <Link to="/admin/products/$id" params={{ id: p.id }} className="rounded-sm p-1.5 hover:bg-muted" title="Edit"><Pencil className="h-4 w-4" /></Link>
                    {p.hasDraftChanges && (
                      <button title="Discard draft" onClick={() => act((id) => discardProductDraft({ data: { id } }), "Draft discarded")(p.id)} className="rounded-sm p-1.5 hover:bg-muted"><RotateCcw className="h-4 w-4" /></button>
                    )}
                    <button title="Publish" onClick={() => act((id) => publishProduct({ data: { id } }), "Published")(p.id)} className="rounded-sm p-1.5 text-primary hover:bg-primary/10"><Send className="h-4 w-4" /></button>
                    <button title="Delete" onClick={() => { if (confirm("Delete this product permanently?")) act((id) => deleteProduct({ data: { id } }), "Deleted")(p.id); }} className="rounded-sm p-1.5 text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
