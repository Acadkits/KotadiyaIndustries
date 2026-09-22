import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Factory, Cog, Layers, PackageCheck, ShieldCheck, Handshake } from "lucide-react";
import { COMPANY, INDUSTRIES } from "@/lib/company";

const icons = [Factory, Cog, Layers, PackageCheck, ShieldCheck, Handshake];

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: `Industries We Serve — ${COMPANY.name}` },
      { name: "description", content: "Precision CNC components supporting construction, automotive, general engineering, fluid handling and mechanical assemblies." },
      { property: "og:title", content: `Industries We Serve — ${COMPANY.name}` },
      { property: "og:url", content: "/industries" },
    ],
    links: [{ rel: "canonical", href: "/industries" }],
  }),
  component: IndustriesPage,
});

function IndustriesPage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 eng-grid opacity-40" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mono-label mb-6 flex items-center gap-3"><span className="h-px w-8 bg-primary" /> Industries</div>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-metallic sm:text-5xl md:text-6xl">
            Supporting Diverse Industrial Requirements
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Our precision CNC components support customers across a range of engineering sectors.
          </p>
        </div>
      </section>
      <section className="border-t border-border/50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Applications" title="Where Our Components Are Used" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((ind, i) => {
              const Icon = icons[i % icons.length];
              return (
                <div key={ind.name} className="rounded-sm bg-card p-6 metallic-border">
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-sm bg-primary/15 text-primary">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{ind.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{ind.body}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Industry list based on typical applications for our components — replace with confirmed customer segments as they become available.
          </p>
        </div>
      </section>
    </>
  );
}
