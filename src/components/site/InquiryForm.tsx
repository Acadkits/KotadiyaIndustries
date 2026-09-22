"use client";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { submitInquiry } from "@/lib/leads.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(1, "Required").max(100),
  company_name: z.string().trim().max(150).optional(),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional(),
  inquiry_type: z.string().optional(),
  message: z.string().trim().min(1, "Required").max(2000),
});

export function InquiryForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [type, setType] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      full_name: fd.get("full_name"),
      company_name: fd.get("company_name") || undefined,
      email: fd.get("email"),
      phone: fd.get("phone") || undefined,
      inquiry_type: type || undefined,
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    try {
      await submitInquiry({
        ...parsed.data,
        company_name: parsed.data.company_name ?? null,
        phone: parsed.data.phone ?? null,
        inquiry_type: parsed.data.inquiry_type ?? null,
        hp: String(fd.get("hp") ?? ""),
      });
      setDone(true);
      toast.success("Inquiry sent. Our team will be in touch.");
      (e.target as HTMLFormElement).reset();
      setType("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send inquiry");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-sm bg-card p-8 metallic-border">
        <div className="mono-label mb-3 text-primary">Received</div>
        <h3 className="font-display text-2xl font-semibold text-foreground">
          Thank you for reaching out.
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          The Kotadiya Industries team will review your inquiry and contact you shortly.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
        >
          Send another inquiry →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-sm bg-card p-6 metallic-border sm:p-8">
      <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name*"><Input name="full_name" required maxLength={100} /></Field>
        <Field label="Company"><Input name="company_name" maxLength={150} /></Field>
        <Field label="Business Email*"><Input name="email" type="email" required maxLength={255} /></Field>
        <Field label="Phone"><Input name="phone" type="tel" maxLength={40} /></Field>
      </div>
      <Field label="Inquiry Type">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder="Select inquiry type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Product Inquiry">Product Inquiry</SelectItem>
            <SelectItem value="Custom Manufacturing">Custom Manufacturing</SelectItem>
            <SelectItem value="OEM Partnership">OEM Partnership</SelectItem>
            <SelectItem value="General Question">General Question</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Message*">
        <Textarea name="message" required rows={5} maxLength={2000} placeholder="Tell us about your requirement…" />
      </Field>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Send Inquiry
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="flex flex-col gap-2">
      <span className="mono-label text-[10px] text-muted-foreground">{label}</span>
      {children}
    </Label>
  );
}
