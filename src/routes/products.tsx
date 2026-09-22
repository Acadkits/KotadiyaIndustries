import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProductCard } from "@/components/site/ProductCard";
import { COMPANY } from "@/lib/company";
import { useSiteProducts } from "@/lib/cms-client";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: `Products — ${COMPANY.name}` },
      { name: "description", content: "Precision CNC components: rebar couplers, shafts, SS nozzles, rivet nuts, flanges, and brass bushes." },
      { property: "og:title", content: `Products — ${COMPANY.name}` },
      { property: "og:description", content: "Precision CNC components manufactured for B2B customers." },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const products = useSiteProducts();
  return (
    <>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 eng-grid opacity-40" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mono-label mb-6 flex items-center gap-3"><span className="h-px w-8 bg-primary" /> Products</div>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-metallic sm:text-5xl md:text-6xl">
            Precision Components, Made to Perform.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A range of standard CNC components — plus fully custom parts manufactured to your drawing and specification.
          </p>
        </div>
      </section>
      <section className="border-t border-border/50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our Range" title="Standard Products" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}
