import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMedia, registerMedia, deleteMedia, updateMediaAlt } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, Trash2, Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/media")({
  head: () => ({ meta: [{ title: "Admin — Media" }, { name: "robots", content: "noindex" }] }),
  component: MediaAdmin,
});

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;

function MediaAdmin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "media"], queryFn: () => listMedia() });
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (!ALLOWED.includes(file.type)) { toast.error(`${file.name}: unsupported`); continue; }
        if (file.size > MAX_BYTES) { toast.error(`${file.name}: > 8MB`); continue; }
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `library/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("site-media").upload(path, file, { contentType: file.type });
        if (error) { toast.error(`${file.name}: ${error.message}`); continue; }
        try {
          await registerMedia({ data: { path, filename: file.name, mime: file.type, size: file.size, alt: "" } });
        } catch (e: any) {
          await supabase.storage.from("site-media").remove([path]);
          toast.error(e.message);
        }
      }
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Uploaded");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-metallic">Media Library</h1>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload images
          <input ref={inputRef} type="file" multiple accept={ALLOWED.join(",")} className="hidden" onChange={(e) => upload(e.target.files)} />
        </label>
      </div>

      {q.isLoading && <div className="text-muted-foreground">Loading…</div>}
      {q.data?.length === 0 && (
        <div className="rounded-sm border border-dashed border-border p-12 text-center text-muted-foreground">
          No images yet. Click "Upload images" to start.
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {q.data?.map((m: any) => (
          <div key={m.id} className="overflow-hidden rounded-sm border border-border bg-card">
            <div className="relative aspect-square bg-muted">
              <img src={m.url} alt={m.alt || m.filename} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="p-3">
              <input
                defaultValue={m.alt}
                placeholder="Alt text"
                onBlur={(e) => {
                  const v = e.target.value;
                  if (v === m.alt) return;
                  updateMediaAlt({ data: { id: m.id, alt: v } }).then(() => {
                    qc.setQueryData(["admin", "media"], (old: any) =>
                      Array.isArray(old) ? old.map((x: any) => (x.id === m.id ? { ...x, alt: v } : x)) : old,
                    );
                  });
                }}
                className="w-full rounded-sm border border-border bg-background px-2 py-1 text-xs"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{(m.size / 1024).toFixed(0)} KB</span>
                <div className="flex gap-1">
                  <button title="Copy path" onClick={() => { navigator.clipboard.writeText(m.path); toast.success("Path copied"); }} className="rounded-sm p-1 hover:bg-muted"><Copy className="h-3.5 w-3.5" /></button>
                  <button
                    title="Delete"
                    onClick={async () => {
                      if (!confirm("Delete this image?")) return;
                      await deleteMedia({ data: { id: m.id, path: m.path } });
                      qc.invalidateQueries({ queryKey: ["admin", "media"] });
                      toast.success("Deleted");
                    }}
                    className="rounded-sm p-1 text-red-400 hover:bg-red-500/10"
                  ><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
