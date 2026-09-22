"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { submitRfq } from "@/lib/leads.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronLeft, ChevronRight, Loader2, Upload, X, FileText, Image as ImageIcon, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

const phoneRe = /^[+()\-\s\d]{7,40}$/;
const digitCount = (s: string) => (s.match(/\d/g) ?? []).length;
const todayIso = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

const stepSchemas = [
  z.object({
    full_name: z.string().trim().min(1, "Full name is required").max(100, "Max 100 characters"),
    company_name: z.string().trim().min(1, "Company name is required").max(150, "Max 150 characters"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(255),
    phone: z.string().trim().min(1, "Phone number is required")
      .refine((v) => phoneRe.test(v) && digitCount(v) >= 7, "Enter a valid phone number"),
    city: z.string().trim().max(100, "Max 100 characters").optional(),
    state: z.string().trim().max(100, "Max 100 characters").optional(),
    country: z.string().trim().max(100, "Max 100 characters").optional(),
  }),
  z.object({
    product_name: z.string().trim().max(200, "Max 200 characters").optional(),
    requirement_type: z.string().trim().min(1, "Select a requirement type"),
    material: z.string().trim().max(200, "Max 200 characters").optional(),
    quantity: z.string().trim().max(80, "Max 80 characters")
      .refine((v) => !v || /\d/.test(v), "Quantity must include a number")
      .optional(),
    expected_delivery_date: z.string().trim().max(30)
      .refine((v) => !v || (!Number.isNaN(Date.parse(v)) && v >= todayIso()), "Date must be today or later")
      .optional(),
  }),
  z.object({}),
  z.object({
    specifications: z.string().trim().max(4000, "Max 4000 characters").optional(),
    additional_notes: z.string().trim().max(2000, "Max 2000 characters").optional(),
    agree: z.literal(true, { errorMap: () => ({ message: "Please agree to be contacted" }) }),
  }),
];

const ACCEPTED_EXTS = ["pdf", "jpg", "jpeg", "png", "step", "stp", "dxf", "dwg"] as const;
type AcceptedExt = (typeof ACCEPTED_EXTS)[number];
const ACCEPTED_ATTR = ACCEPTED_EXTS.map((e) => `.${e}`).join(",");
const MAX_FILE_MB = 15;
const MAX_TOTAL_MB = 60;
const MAX_FILES = 10;

// MIME allow-list keyed by extension. Text formats (step/stp/dxf/dwg) come
// through inconsistently across OSes, so we accept empty/octet-stream for them
// and rely on magic-number sniffing below.
const MIME_BY_EXT: Record<AcceptedExt, string[]> = {
  pdf: ["application/pdf"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  step: ["model/step", "model/step+zip", "application/step", "application/octet-stream", "text/plain", ""],
  stp: ["model/step", "application/step", "application/octet-stream", "text/plain", ""],
  dxf: ["image/vnd.dxf", "application/dxf", "application/octet-stream", "text/plain", ""],
  dwg: ["image/vnd.dwg", "application/acad", "application/dwg", "application/octet-stream", ""],
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type UploadStatus = "uploading" | "done" | "error";
type UploadItem = {
  id: string;
  file: File;
  path?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  previewUrl?: string;
  xhr?: XMLHttpRequest;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// Reject filenames with control chars, path separators, or double extensions
// (e.g. "drawing.pdf.exe"). Returns the single trailing extension or null.
function safeExt(name: string): AcceptedExt | null {
  if (!name || name.length > 200) return null;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f/\\<>:"|?*]/.test(name)) return null;
  const parts = name.split(".");
  if (parts.length < 2) return null;
  const ext = parts[parts.length - 1]!.toLowerCase();
  // block double-extension attacks: only ONE recognised dot-suffix allowed,
  // and no intermediate segment may itself be an executable/script extension.
  const BAD_INNER = new Set(["exe", "bat", "cmd", "sh", "js", "jsx", "ts", "html", "htm", "svg", "php", "py", "rb", "jar", "msi", "dll", "app", "scr", "com"]);
  for (let i = 1; i < parts.length - 1; i++) {
    if (BAD_INNER.has(parts[i]!.toLowerCase())) return null;
  }
  return (ACCEPTED_EXTS as readonly string[]).includes(ext) ? (ext as AcceptedExt) : null;
}

// Read first bytes and validate the file's real magic number matches its
// claimed extension. Prevents renaming a .exe to .pdf.
async function magicOk(file: File, ext: AcceptedExt): Promise<boolean> {
  const buf = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  const hex = Array.from(buf.slice(0, 8)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const asAscii = new TextDecoder("ascii", { fatal: false }).decode(buf);
  switch (ext) {
    case "pdf":
      return hex.startsWith("25504446"); // %PDF
    case "png":
      return hex.startsWith("89504e470d0a1a0a");
    case "jpg":
    case "jpeg":
      return hex.startsWith("ffd8ff");
    case "step":
    case "stp":
      // ASCII STEP files start with ISO-10303-21; STEP+zip starts with PK
      return /ISO-10303-21/.test(asAscii) || hex.startsWith("504b0304");
    case "dxf":
      // ASCII DXF starts with "  0\nSECTION"; binary DXF has "AutoCAD Binary DXF"
      return /SECTION/.test(asAscii) || /AutoCAD Binary DXF/.test(asAscii);
    case "dwg":
      // DWG files start with "AC10..".."AC1032" etc.
      return /^AC1[0-9]/.test(asAscii);
    default:
      return false;
  }
}


export function RfqForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dragCounter = useRef(0);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const set = (k: string, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      uploads.forEach((u) => u.previewUrl && URL.revokeObjectURL(u.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploading = uploads.some((u) => u.status === "uploading");
  const hasFailedUploads = uploads.some((u) => u.status === "error");

  async function next() {
    const schema = stepSchemas[step];
    const payload = step === 3 ? { ...data, agree } : data;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error(parsed.error.issues[0]?.message ?? "Please complete required fields");
      // Focus the first invalid field
      requestAnimationFrame(() => {
        const first = Object.keys(fieldErrors)[0];
        if (first) {
          const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
          el?.focus();
        }
      });
      return;
    }
    if (step === 2) {
      if (uploading) {
        toast.error("Please wait for uploads to finish");
        return;
      }
      if (hasFailedUploads) {
        toast.error("Retry or remove failed uploads before continuing");
        return;
      }
    }
    setErrors({});
    if (step === 3) {
      await handleSubmit();
      return;
    }
    setStep((s) => s + 1);
  }

  function startUpload(item: UploadItem, ext: AcceptedExt) {
    // Randomised path; user-supplied filename never touches storage keys.
    const uuid = (crypto as unknown as { randomUUID?: () => string }).randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const path = `inbox/${uuid}.${ext}`;
    const contentType = item.file.type || "application/octet-stream";
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/rfq-uploads/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_KEY}`);
    xhr.setRequestHeader("apikey", SUPABASE_KEY);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("Content-Type", contentType);
    // Explicitly prevent inline rendering of anything untrusted.
    xhr.setRequestHeader("Cache-Control", "private, no-store");

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, progress: pct } : x)));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, status: "done", progress: 100, path, xhr: undefined } : x)));
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try { const j = JSON.parse(xhr.responseText); if (j.message) msg = j.message; } catch { /* noop */ }
        setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, status: "error", error: msg, xhr: undefined } : x)));
        toast.error(`${item.file.name}: ${msg}`);
      }
    };
    xhr.onerror = () => {
      setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, status: "error", error: "Network error", xhr: undefined } : x)));
    };
    xhr.send(item.file);
    return xhr;
  }

  async function handleFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    // Pre-flight: validate each file (name, size, MIME, magic number) BEFORE
    // any upload starts. Do it serially so limit checks stay consistent.
    let totalBytes = uploads.reduce((s, u) => s + u.file.size, 0);
    let currentCount = uploads.length;
    const accepted: Array<{ file: File; ext: AcceptedExt }> = [];

    for (const file of incoming) {
      const ext = safeExt(file.name);
      if (!ext) {
        toast.error(`${file.name} — unsupported or unsafe file name`);
        continue;
      }
      const allowedMimes = MIME_BY_EXT[ext];
      if (file.type && !allowedMimes.includes(file.type)) {
        toast.error(`${file.name} — file type does not match .${ext}`);
        continue;
      }
      if (file.size === 0) {
        toast.error(`${file.name} — file is empty`);
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${file.name} — ${formatBytes(file.size)} exceeds ${MAX_FILE_MB} MB limit`);
        continue;
      }
      if (uploads.some((u) => u.file.name === file.name && u.file.size === file.size)
          || accepted.some((a) => a.file.name === file.name && a.file.size === file.size)) {
        toast.error(`${file.name} — already added`);
        continue;
      }
      if (currentCount >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files`);
        break;
      }
      if (totalBytes + file.size > MAX_TOTAL_MB * 1024 * 1024) {
        toast.error(`Total upload size would exceed ${MAX_TOTAL_MB} MB`);
        break;
      }
      // Magic-number check catches renamed executables (e.g. .exe → .pdf).
      let ok = false;
      try { ok = await magicOk(file, ext); } catch { ok = false; }
      if (!ok) {
        toast.error(`${file.name} — file contents do not match .${ext}`);
        continue;
      }
      totalBytes += file.size;
      currentCount += 1;
      accepted.push({ file, ext });
    }

    if (!accepted.length) return;
    setUploads((prev) => {
      const next = [...prev];
      for (const { file, ext } of accepted) {
        const isImage = file.type.startsWith("image/");
        const item: UploadItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          progress: 0,
          status: "uploading",
          previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        };
        item.xhr = startUpload(item, ext);
        next.push(item);
      }
      return next;
    });
  }


  async function removeUpload(id: string) {
    const item = uploads.find((u) => u.id === id);
    if (!item) return;
    if (item.xhr) item.xhr.abort();
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.path) {
      supabase.storage.from("rfq-uploads").remove([item.path]).catch(() => {});
    }
    setUploads((u) => u.filter((x) => x.id !== id));
  }

  function retryUpload(id: string) {
    const item = uploads.find((u) => u.id === id);
    if (!item) return;
    const ext = safeExt(item.file.name);
    if (!ext) return;
    setUploads((u) => u.map((x) => (x.id === id ? { ...x, status: "uploading", progress: 0, error: undefined } : x)));
    startUpload({ ...item, status: "uploading", progress: 0 }, ext);
  }


  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.types.includes("Files")) setDragging(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) { setDragging(false); dragCounter.current = 0; }
  }, []);
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current = 0;
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    if (uploading) {
      toast.error("Please wait for uploads to finish");
      return;
    }
    setLoading(true);
    try {
      await submitRfq({
        full_name: data.full_name!,
        company_name: data.company_name!,
        email: data.email!,
        phone: data.phone!,
        city: data.city ?? null,
        state: data.state ?? null,
        country: data.country ?? null,
        requirement_type: data.requirement_type!,
        product_name: data.product_name ?? null,
        material: data.material ?? null,
        quantity: data.quantity ?? null,
        expected_delivery_date: data.expected_delivery_date ?? null,
        specifications: data.specifications ?? null,
        additional_notes: data.additional_notes ?? null,
        file_urls: uploads.filter((u) => u.status === "done" && u.path).map((u) => ({ name: u.file.name, path: u.path! })),
        hp: "",
      });
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit RFQ");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-sm bg-card p-8 sm:p-12 metallic-border text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
          <Check size={22} />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
          Thank you for sharing your requirement.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          The Kotadiya Industries team will review your inquiry and contact you shortly.
        </p>
      </div>
    );
  }

  const stepTitles = ["Contact", "Requirement", "Technical Files", "Additional"];
  const doneCount = uploads.filter((u) => u.status === "done").length;
  const totalBytes = uploads.reduce((s, u) => s + u.file.size, 0);
  const doneBytes = uploads.filter((u) => u.status === "done").reduce((s, u) => s + u.file.size, 0);

  return (
    <div className="rounded-sm bg-card p-6 sm:p-10 metallic-border">
      {/* Progress */}
      <div className="mb-8 grid grid-cols-4 gap-2">
        {stepTitles.map((t, i) => (
          <div key={t} className="flex flex-col gap-2">
            <div className={cn("h-0.5 w-full transition-colors", i <= step ? "bg-primary" : "bg-border/60")} />
            <div className="flex items-center gap-2">
              <span className={cn("mono-label", i <= step ? "text-primary" : "text-muted-foreground")}>
                Step {i + 1}
              </span>
              <span className={cn("hidden text-xs sm:inline", i <= step ? "text-foreground" : "text-muted-foreground")}>
                {t}
              </span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
          className="grid gap-5"
        >
          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <F label="Full Name*" name="full_name" error={errors.full_name}><Input data-field="full_name" aria-invalid={!!errors.full_name} value={data.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} maxLength={100} /></F>
              <F label="Company Name*" name="company_name" error={errors.company_name}><Input data-field="company_name" aria-invalid={!!errors.company_name} value={data.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} maxLength={150} /></F>
              <F label="Business Email*" name="email" error={errors.email}><Input data-field="email" aria-invalid={!!errors.email} type="email" value={data.email ?? ""} onChange={(e) => set("email", e.target.value)} maxLength={255} /></F>
              <F label="Phone Number*" name="phone" error={errors.phone}><Input data-field="phone" aria-invalid={!!errors.phone} type="tel" value={data.phone ?? ""} onChange={(e) => set("phone", e.target.value)} maxLength={40} /></F>
              <F label="City" name="city" error={errors.city}><Input data-field="city" value={data.city ?? ""} onChange={(e) => set("city", e.target.value)} maxLength={100} /></F>
              <F label="State" name="state" error={errors.state}><Input data-field="state" value={data.state ?? ""} onChange={(e) => set("state", e.target.value)} maxLength={100} /></F>
              <F label="Country" name="country" error={errors.country}><Input data-field="country" value={data.country ?? ""} onChange={(e) => set("country", e.target.value)} maxLength={100} /></F>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5">
              <F label="Product or Component Name" name="product_name" error={errors.product_name}>
                <Input data-field="product_name" value={data.product_name ?? ""} onChange={(e) => set("product_name", e.target.value)} maxLength={200} />
              </F>
              <F label="Requirement Type*" name="requirement_type" error={errors.requirement_type}>
                <Select value={data.requirement_type ?? ""} onValueChange={(v) => set("requirement_type", v)}>
                  <SelectTrigger data-field="requirement_type" aria-invalid={!!errors.requirement_type}><SelectValue placeholder="Select requirement type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Existing Product">Existing Product</SelectItem>
                    <SelectItem value="Custom Component">Custom Component</SelectItem>
                    <SelectItem value="OEM Manufacturing">OEM Manufacturing</SelectItem>
                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </F>
              <div className="grid gap-5 sm:grid-cols-2">
                <F label="Material" name="material" error={errors.material}><Input data-field="material" value={data.material ?? ""} onChange={(e) => set("material", e.target.value)} placeholder="e.g. MS, SS304, Brass" /></F>
                <F label="Required Quantity" name="quantity" error={errors.quantity}><Input data-field="quantity" aria-invalid={!!errors.quantity} value={data.quantity ?? ""} onChange={(e) => set("quantity", e.target.value)} placeholder="e.g. 500 nos" /></F>
              </div>
              <F label="Expected Delivery Date (optional)" name="expected_delivery_date" error={errors.expected_delivery_date}>
                <Input data-field="expected_delivery_date" aria-invalid={!!errors.expected_delivery_date} type="date" min={todayIso()} value={data.expected_delivery_date ?? ""} onChange={(e) => set("expected_delivery_date", e.target.value)} />
              </F>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5">
              <div
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
                role="button"
                tabIndex={0}
                aria-label="Upload technical files"
                className={cn(
                  "relative cursor-pointer rounded-sm border-2 border-dashed p-8 text-center transition outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  dragging ? "border-primary bg-primary/10" : "border-border/70 bg-background/40 hover:border-primary/60 hover:bg-primary/5",
                )}
              >
                <Upload size={26} className="mx-auto text-primary" />
                <p className="mt-3 font-medium text-foreground">Drop drawings here or click to upload</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ACCEPTED_EXTS.map((e) => e.toUpperCase()).join(" · ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Up to {MAX_FILES} files · {MAX_FILE_MB} MB each · {MAX_TOTAL_MB} MB total
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_ATTR}
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                {dragging && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-sm bg-primary/15 backdrop-blur-sm">
                    <span className="mono-label text-primary">Drop files to upload</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Your technical files will be used only to review your manufacturing requirement.
              </p>
              {uploading && (
                <p role="status" className="text-xs text-muted-foreground">
                  Uploads in progress — please wait before continuing.
                </p>
              )}
              {hasFailedUploads && !uploading && (
                <p role="alert" className="text-xs font-medium text-destructive">
                  One or more uploads failed. Retry or remove them before continuing.
                </p>
              )}
              {uploads.length > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{doneCount} of {uploads.length} uploaded</span>
                    <span>{formatBytes(doneBytes)} / {formatBytes(totalBytes)}</span>
                  </div>
                  <ul className="grid gap-2">
                    {uploads.map((u) => (
                      <li key={u.id} className="flex items-center gap-3 rounded-sm border border-border/60 bg-background/40 p-3 text-sm">
                        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-sm bg-secondary/60 text-primary">
                          {u.previewUrl ? (
                            <img src={u.previewUrl} alt="" className="h-full w-full object-cover" />
                          ) : u.file.type.startsWith("image/") ? (
                            <ImageIcon size={16} />
                          ) : (
                            <FileText size={16} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="truncate font-medium text-foreground">{u.file.name}</p>
                            <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(u.file.size)}</span>
                          </div>
                          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border/50">
                            <div
                              className={cn(
                                "h-full transition-all duration-200",
                                u.status === "error" ? "bg-destructive" : u.status === "done" ? "bg-primary" : "bg-primary/70",
                              )}
                              style={{ width: `${u.progress}%` }}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
                                u.status === "done" && "bg-primary/15 text-primary",
                                u.status === "uploading" && "bg-secondary text-muted-foreground",
                                u.status === "error" && "bg-destructive/15 text-destructive",
                              )}
                            >
                              {u.status === "done" ? "Uploaded" : u.status === "error" ? "Failed" : `Uploading ${u.progress}%`}
                            </span>
                            {u.error && <span className="truncate text-destructive">{u.error}</span>}
                          </div>
                        </div>
                        {u.status === "error" && (
                          <button type="button" onClick={() => retryUpload(u.id)} aria-label="Retry upload" className="text-muted-foreground hover:text-primary">
                            <RotateCw size={16} />
                          </button>
                        )}
                        <button type="button" onClick={() => removeUpload(u.id)} aria-label="Remove file" className="text-muted-foreground hover:text-destructive">
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5">
              <F label="Component Specifications" name="specifications" error={errors.specifications}>
                <Textarea data-field="specifications" rows={4} value={data.specifications ?? ""} onChange={(e) => set("specifications", e.target.value)} maxLength={4000} placeholder="Dimensions, tolerances, surface finish, etc." />
              </F>
              <F label="Additional Notes" name="additional_notes" error={errors.additional_notes}>
                <Textarea data-field="additional_notes" rows={3} value={data.additional_notes ?? ""} onChange={(e) => set("additional_notes", e.target.value)} maxLength={2000} />
              </F>
              <div>
                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Checkbox checked={agree} onCheckedChange={(v) => { setAgree(Boolean(v)); if (errors.agree) setErrors((e) => ({ ...e, agree: "" })); }} className="mt-0.5" data-field="agree" />
                  <span>I agree to be contacted regarding this inquiry.</span>
                </label>
                {errors.agree && (
                  <p role="alert" className="mt-2 text-xs text-destructive">{errors.agree}</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || loading}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-foreground disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={loading || (step === 2 && uploading)}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {(loading || (step === 2 && uploading)) && <Loader2 size={14} className="animate-spin" />}
          {step === 3 ? "Submit RFQ" : step === 2 && uploading ? "Uploading…" : "Continue"}
          {step !== 3 && !(step === 2 && uploading) && <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
}

function F({ label, name, error, children }: { label: string; name?: string; error?: string; children: React.ReactNode }) {
  const errorId = name && error ? `${name}-error` : undefined;
  return (
    <Label className="flex flex-col gap-2">
      <span className="mono-label text-muted-foreground">{label}</span>
      <div className={cn(error && "[&_input,&_textarea,&_[role=combobox]]:border-destructive")} aria-describedby={errorId}>
        {children}
      </div>
      {error && (
        <span id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </span>
      )}
    </Label>
  );
}
