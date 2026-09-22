import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/site/MagneticButton";
import { ProductCard } from "@/components/site/ProductCard";
import { COMPANY } from "@/lib/company";
import { useSiteProducts } from "@/lib/cms-client";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    return {
      meta: [
        { title: `${params.slug} — ${COMPANY.name}` },
        { property: "og:title", content: `${params.slug} — ${COMPANY.name}` },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/products/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/products/${params.slug}` }],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-metallic">Product not found</h1>
      <Link to="/products" className="mt-6 inline-block text-primary hover:underline">Back to all products</Link>
    </div>
  ),
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const products = useSiteProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) throw notFound();
  const others = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <>
      <section className="border-b border-border/50 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:gap-16 sm:px-6 lg:px-8">
          <div className="relative aspect-square overflow-hidden rounded-sm bg-[oklch(0.94_0.005_250)] metallic-border">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                style={{
                  objectPosition: product.imagePosition === "top" ? "50% 22%" : "50% 78%",
                  transform: "scale(1.4)",
                }}
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-muted-foreground">No image</div>
            )}
          </div>
          <div>
            <Link to="/products" className="mono-label inline-flex items-center gap-2 !text-muted-foreground hover:!text-primary">
              <ArrowLeft size={12} /> All Products
            </Link>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-metallic sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {product.blurb}
            </p>

            {product.applications?.length > 0 && (
              <div className="mt-8 rounded-sm bg-card p-6 metallic-border">
                <div className="mono-label mb-3 !text-primary">Applications</div>
                <ul className="space-y-2">
                  {product.applications.map((a: string) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-2 h-1 w-4 shrink-0 bg-primary" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoBlock label="Material">Confirmed to your specification. Common options include MS, SS, Brass, Aluminium.</InfoBlock>
              <InfoBlock label="Manufacturing">Precision CNC machining with process controls and inspection.</InfoBlock>
              <InfoBlock label="Dimensions">Available on request — please share your drawing.</InfoBlock>
              <InfoBlock label="Batch Size">One-off through production volumes.</InfoBlock>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <MagneticButton href="/quote">Request Quote for This Product <ArrowRight size={16} /></MagneticButton>
              <MagneticButton href="/quote" variant="ghost">Discuss Custom Requirements</MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="py-20 sm:py-24 bg-[oklch(0.168_0.010_250)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mono-label mb-6 !text-primary">Related Products</div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card/60 p-4">
      <div className="mono-label !text-[10px] text-muted-foreground">{label}</div>
      <p className="mt-1.5 text-sm text-foreground">{children}</p>
    </div>
  );
}
