import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/site/MagneticButton";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/quality")({
  head: () => ({
    meta: [
      { title: `Quality — ${COMPANY.name}` },
      { name: "description", content: "Quality-first CNC manufacturing — from material review through final dispatch." },
      { property: "og:title", content: `Quality — ${COMPANY.name}` },
      { property: "og:url", content: "/quality" },
    ],
    links: [{ rel: "canonical", href: "/quality" }],
  }),
  component: QualityPage,
});

const workflow = ["Material Review", "Manufacturing", "Dimensional Inspection", "Final Review", "Dispatch"];

function QualityPage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 eng-grid opacity-40" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mono-label mb-6 flex items-center gap-3"><span className="h-px w-8 bg-primary" /> Quality</div>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-metallic sm:text-5xl md:text-6xl">
            Quality at Every Stage.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Quality is the foundation of everything we do — from the material we accept to the components we dispatch.
          </p>
        </div>
      </section>

      <section className="border-t border-border/50 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>
            At Kotadiya Industries, quality is more than a checkpoint — it is a continuous
            commitment. We manufacture precision CNC components that meet customer
            requirements and industry standards, using advanced technology, strict quality
            control procedures, and continuous process improvement.
          </p>
          <p>
            We strive for complete customer satisfaction by delivering defect-free products
            on time, maintaining excellence in workmanship, and continuously enhancing the
            skills of our team.
          </p>
          <p className="mono-label !text-primary/80">
            "Quality is not just our standard — it is our commitment to every component we manufacture."
          </p>
        </div>
      </section>

      <section className="border-t border-border/50 bg-[oklch(0.168_0.010_250)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Workflow" title="How Quality Flows Through Production" />
          <div className="mt-12 grid gap-3 md:grid-cols-5">
            {workflow.map((s, i, arr) => (
              <div key={s} className="relative flex flex-col items-center rounded-sm bg-card p-5 text-center metallic-border">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 mono-label !text-primary">{i + 1}</div>
                <p className="mt-4 text-sm font-semibold text-foreground">{s}</p>
                {i < arr.length - 1 && (
                  <div className="pointer-events-none absolute right-[-6px] top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight size={14} className="text-primary/60" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Discuss" title="Have a quality-critical requirement?" align="center" />
          <div className="mt-8 flex justify-center">
            <MagneticButton href="/quote">Request a Quote <ArrowRight size={16} /></MagneticButton>
          </div>
        </div>
      </section>
    </>
  );
}
