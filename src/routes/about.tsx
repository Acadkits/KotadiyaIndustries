import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { MagneticButton } from "@/components/site/MagneticButton";
import { ArrowRight, Target, Compass, ShieldCheck, Heart } from "lucide-react";
import { COMPANY } from "@/lib/company";
import factory from "@/assets/factory-interior.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${COMPANY.name}` },
      { name: "description", content: "A precision-first CNC manufacturing company built around quality, accuracy and reliable customer partnerships." },
      { property: "og:title", content: `About — ${COMPANY.name}` },
      { property: "og:description", content: "A precision-first CNC manufacturing company built around quality, accuracy and reliable partnerships." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 eng-grid opacity-40" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mono-label mb-6 flex items-center gap-3"><span className="h-px w-8 bg-primary" /> About Us</div>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-metallic sm:text-5xl md:text-6xl">
            A New Manufacturing Company Built With a Precision-First Approach
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Kotadiya Industries is a trusted manufacturer of precision-engineered CNC components,
            dedicated to delivering high-quality machining solutions across a range of industries.
          </p>
        </div>
      </section>

      <section className="border-y border-border/50 py-20 sm:py-24 bg-[oklch(0.168_0.010_250)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:items-center lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-sm metallic-border">
              <img src={factory} alt="Manufacturing floor" loading="lazy" decoding="async" className="aspect-[4/3] h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-transparent" />
            </div>
          </Reveal>
          <div className="space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              With a strong focus on accuracy, consistency, and innovation, we specialise in manufacturing
              CNC parts that meet high standards of performance and reliability.
            </p>
            <p>
              Equipped with advanced CNC machining technology and a skilled team, we are committed to
              producing components with precision and superior quality. Our processes are designed for
              efficiency, timely delivery, and customer satisfaction while maintaining strict quality control.
            </p>
            <p>
              We believe in building long-term partnerships through reliability, technical expertise, and
              continuous improvement — providing customised machining solutions that support our clients' growth.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:px-8">
          {[
            { icon: Target, title: "Vision", body: "To be a trusted leader in precision CNC manufacturing — recognised for quality, innovation, and engineering excellence. We aim to deliver high-performance components, drive technological advancement, and create lasting value for our customers and stakeholders." },
            { icon: Compass, title: "Mission", body: "To manufacture high-quality precision CNC components that exceed customer expectations through advanced technology, skilled craftsmanship, and strict quality standards — while fostering innovation, continuous improvement, and long-term relationships." },
            { icon: ShieldCheck, title: "Quality Commitment", body: "Quality is the foundation of everything we do. Advanced manufacturing, strict quality control, and continuous process improvement ensure accuracy, reliability, and performance in every component." },
            { icon: Heart, title: "Customer-Focused Approach", body: "We take time to understand each customer's requirement so we can deliver components that fit the application, budget, and timeline — building the trust that long-term partnerships depend on." },
          ].map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <div className="relative h-full rounded-sm bg-card p-8 metallic-border">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-sm bg-primary/15 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 py-24 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Let's Work Together" title="Precision in Manufacturing. Excellence in Every Component." align="center" />
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <MagneticButton href="/quote">Request a Quote <ArrowRight size={16} /></MagneticButton>
            <Link to="/capabilities" className="rounded-sm border border-border/70 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:border-primary hover:text-primary">
              See Capabilities
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
