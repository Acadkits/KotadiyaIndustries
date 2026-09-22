import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listContentAdmin, saveContentDraft, publishContent } from "@/lib/cms.functions";
import { useState } from "react";
import { toast } from "sonner";
import { Save, Send, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { CONTENT_SCHEMAS, normalize, schemaDefault, validate } from "@/components/admin/content-editors/schemas";
import { SectionForm } from "@/components/admin/content-editors/SectionForm";

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: () => ({ meta: [{ title: "Admin — Site Content" }, { name: "robots", content: "noindex" }] }),
  component: ContentAdmin,
});

function ContentAdmin() {
  const q = useQuery({ queryKey: ["admin", "content"], queryFn: () => listContentAdmin() });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold text-metallic">Site Content</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Edit each section of the website. Save a draft to keep changes private, or Publish to make them live.
      </p>
      {q.isLoading && <div className="text-muted-foreground">Loading…</div>}
      <div className="space-y-3">
        {q.data?.map((block: any) => <BlockRow key={block.key} block={block} />)}
      </div>
    </div>
  );
}

function BlockRow({ block }: { block: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const schema = CONTENT_SCHEMAS[block.key];
  const initial = block.draft && Object.keys(block.draft).length > 0
    ? block.draft
    : block.published ?? schemaDefault(block.key);

  const [value, setValue] = useState<any>(initial);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(initial, null, 2));
  const [err, setErr] = useState<string | null>(null);

  const hasChanges = JSON.stringify(block.draft ?? {}) !== JSON.stringify(block.published ?? {});

  const buildPayload = (): any => {
    if (showJson || !schema) {
      return JSON.parse(jsonText);
    }
    const normalized = normalize(schema, value);
    const errs = validate(schema, normalized);
    if (errs.length) throw new Error(errs[0]);
    return normalized;
  };

  const mSave = useMutation({
    mutationFn: async () => {
      let draft: any;
      try { draft = buildPayload(); } catch (e: any) { throw new Error(e.message); }
      return saveContentDraft({ data: { key: block.key, draft } });
    },
    onSuccess: () => {
      toast.success("Saved");
      setErr(null);
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
    },
    onError: (e: any) => setErr(e.message),
  });

  const onReset = () => {
    setValue(initial);
    setJsonText(JSON.stringify(initial, null, 2));
    setErr(null);
  };

  return (
    <div className="rounded-sm border border-border bg-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <div>
            <div className="font-semibold">{block.label || block.key}</div>
            <div className="text-xs text-muted-foreground">{block.key}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {hasChanges && <span className="rounded-sm bg-blue-500/10 px-2 py-0.5 text-blue-400">Draft</span>}
          {block.published && <span className="rounded-sm bg-green-500/10 px-2 py-0.5 text-green-400">Live</span>}
        </div>
      </button>
      {open && (
        <div className="border-t border-border p-4">
          {schema && !showJson ? (
            <SectionForm schema={schema} value={value} onChange={setValue} />
          ) : (
            <>
              {!schema && (
                <p className="mb-2 text-xs text-muted-foreground">
                  No guided editor for this section — using raw JSON.
                </p>
              )}
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={14}
                spellCheck={false}
                className="w-full rounded-sm border border-border bg-background p-3 font-mono text-xs"
              />
            </>
          )}

          {err && <div className="mt-3 rounded-sm border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">{err}</div>}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => mSave.mutate()}
              disabled={mSave.isPending}
              className="inline-flex items-center gap-1.5 rounded-sm border border-primary px-3 py-1.5 text-sm text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Save draft
            </button>
            <button
              onClick={async () => {
                try {
                  await mSave.mutateAsync();
                      await publishContent({ data: { key: block.key } });
                  toast.success("Published");
                  qc.invalidateQueries({ queryKey: ["admin", "content"] });
                  qc.invalidateQueries({ queryKey: ["site"] });
                } catch {
                  /* mSave already surfaced the error */
                }
              }}
              disabled={mSave.isPending}
              className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Publish
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            {schema && (
              <button
                onClick={() => {
                  if (!showJson) setJsonText(JSON.stringify(value, null, 2));
                  else {
                    try { setValue(JSON.parse(jsonText)); } catch { /* ignore */ }
                  }
                  setShowJson(!showJson);
                }}
                className="ml-auto text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {showJson ? "Use guided editor" : "Advanced (JSON)"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
