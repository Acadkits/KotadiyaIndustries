import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMedia, registerMedia } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;

export function MediaPickerDialog({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (path: string, url: string) => void;
}) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "media"], queryFn: () => listMedia(), enabled: open });
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (!ALLOWED.includes(file.type)) { toast.error(`${file.name}: unsupported type`); continue; }
        if (file.size > MAX_BYTES) { toast.error(`${file.name}: over 8MB`); continue; }
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const uuid = crypto.randomUUID();
        const path = `library/${uuid}.${ext}`;
        const { error: upErr } = await supabase.storage.from("site-media").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (upErr) { toast.error(`${file.name}: ${upErr.message}`); continue; }
        try {
          await registerMedia({ data: { path, filename: file.name, mime: file.type, size: file.size, alt: "" } });
        } catch (e: any) {
          await supabase.storage.from("site-media").remove([path]);
          toast.error(`${file.name}: ${e.message || "register failed"}`);
          continue;
        }
      }
      await qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Upload complete");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-sm border border-border bg-background" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-semibold">Media Library</h2>
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
              <input ref={inputRef} type="file" multiple accept={ALLOWED.join(",")} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            <button onClick={onClose} className="rounded-sm p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {q.isLoading && <div className="p-8 text-center text-muted-foreground">Loading…</div>}
          {q.data && q.data.length === 0 && <div className="p-8 text-center text-muted-foreground">No images yet — upload one to get started.</div>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {q.data?.map((m: any) => (
              <button
                key={m.id}
                onClick={() => onPick(m.path, m.url)}
                className="group relative aspect-square overflow-hidden rounded-sm border border-border bg-muted transition hover:border-primary"
              >
                <img src={m.url} alt={m.alt || m.filename} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 truncate bg-black/70 p-1 text-xs text-white opacity-0 transition group-hover:opacity-100">{m.filename}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
