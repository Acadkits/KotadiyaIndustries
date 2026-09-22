import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { RfqForm } from "@/components/site/RfqForm";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: `Request a Quote — ${COMPANY.name}` },
      { name: "description", content: "Submit a detailed manufacturing inquiry with drawings, materials and quantity. Our team will review and respond with a quotation." },
      { property: "og:title", content: `Request a Quote — ${COMPANY.name}` },
      { property: "og:url", content: "/quote" },
    ],
    links: [{ rel: "canonical", href: "/quote" }],
  }),
  component: QuotePage,
});

function QuotePage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 sm:py-28">
        <div className="absolute inset-0 -z-10 eng-grid opacity-40" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mono-label mb-6 flex items-center gap-3"><span className="h-px w-8 bg-primary" /> Request a Quote</div>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-metallic sm:text-5xl md:text-6xl">
            Share your requirement. Get a quotation.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Complete the form below and upload any technical drawings. Our team will
            review your requirement and get in touch.
          </p>
        </div>
      </section>
      <section className="border-t border-border/50 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <RfqForm />
        </div>
      </section>
    </>
  );
}
