import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CapabilityCard } from "@/components/site/CapabilityCard";
import { Reveal } from "@/components/site/Reveal";
import { MagneticButton } from "@/components/site/MagneticButton";
import { ArrowRight } from "lucide-react";
import { CAPABILITIES, PROCESS_STEPS, COMPANY } from "@/lib/company";

export const Route = createFileRoute("/capabilities")({
  head: () => ({
    meta: [
      { title: `Manufacturing Capabilities — ${COMPANY.name}` },
      { name: "description", content: "CNC turning, milling, custom component manufacturing, and quality-focused engineering for B2B customers." },
      { property: "og:title", content: `Manufacturing Capabilities — ${COMPANY.name}` },
      { property: "og:description", content: "CNC turning, milling, custom components, and quality-focused engineering." },
      { property: "og:url", content: "/capabilities" },
    ],
    links: [{ rel: "canonical", href: "/capabilities" }],
  }),
  component: CapabilitiesPage,
});

function CapabilitiesPage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 eng-grid opacity-40" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mono-label mb-6 flex items-center gap-3"><span className="h-px w-8 bg-primary" /> Capabilities</div>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-metallic sm:text-5xl md:text-6xl">
            Manufacturing Capability, End to End.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            CNC-based precision manufacturing focused on accuracy, consistency, and repeatable quality across every batch.
          </p>
        </div>
      </section>

      <section className="border-t border-border/50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What We Do" title="Core Capabilities" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c, i) => <CapabilityCard key={c.title} title={c.title} body={c.body} index={i} />)}
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-[oklch(0.168_0.010_250)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Machinery" title="Machinery & Equipment" intro="A CNC-focused shop floor supporting turning and milling operations." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["CNC Turning Centres", "CNC Milling Machines", "Inspection & Measurement"].map((m) => (
              <div key={m} className="rounded-sm bg-card p-6 metallic-border eng-grid-fine">
                <div className="mono-label !text-[10px] text-muted-foreground">Editable placeholder</div>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{m}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Detailed machine make, model and capacity to be added.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Materials" title="Supported Materials" intro="Common CNC-machinable metals — final material grade confirmed against your drawing." />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Mild Steel", "Stainless Steel", "Brass", "Aluminium"].map((m) => (
              <div key={m} className="rounded-sm bg-card p-5 metallic-border" style={{ background: "var(--gradient-metal)" }}>
                <div className="mono-label !text-primary">Material</div>
                <p className="mt-2 font-display text-lg font-semibold text-foreground">{m}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/50 py-20 sm:py-24 bg-[oklch(0.168_0.010_250)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Workflow" title="Custom Manufacturing Workflow" />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESS_STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <li className="rounded-sm bg-card p-6 metallic-border">
                  <div className="mono-label mb-3 !text-primary">{s.n}</div>
                  <h3 className="font-display text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <div className="mt-12 flex justify-center">
            <MagneticButton href="/quote">Start a Quotation <ArrowRight size={16} /></MagneticButton>
          </div>
        </div>
      </section>
    </>
  );
}
