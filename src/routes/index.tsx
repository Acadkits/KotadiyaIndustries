import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Cog, Factory, Gauge, MessageCircle, Phone, Mail, MapPin, Upload, ScrollText, PackageCheck, ShieldCheck, Truck, Handshake, Layers, Ruler } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { CapabilityCard } from "@/components/site/CapabilityCard";
import { MagneticButton } from "@/components/site/MagneticButton";
import { useSiteCompany, useSiteContent, useSiteProducts, whatsappHrefFor } from "@/lib/cms-client";
import factoryImg from "@/assets/factory-interior.jpg";
import blueprintImg from "@/assets/blueprint-bg.jpg";

import heroImg from "@/assets/hero-cnc.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" },
    ],
    meta: [
      { name: "referrer", content: "strict-origin-when-cross-origin" },
    ],
  }),
  component: HomePage,
});

const capabilityIcons = [Cog, Factory, Layers, ShieldCheck, PackageCheck, Ruler];
const industryIcons = [Factory, Cog, Layers, PackageCheck, ShieldCheck, Handshake];

function HomePage() {
  const COMPANY = useSiteCompany();
  const PRODUCTS = useSiteProducts();
  const CAPABILITIES = useSiteContent("home.capabilities").items ?? [];
  const PROCESS_STEPS = useSiteContent("home.process").items ?? [];
  const INDUSTRIES = useSiteContent("home.industries").items ?? [];
  const WHY_US = useSiteContent("home.why").items ?? [];
  const whatsappHref = () => whatsappHrefFor(COMPANY.phoneDigits);
  return (

    <>
      <Hero />

      {/* SECTION 2 — INTRODUCTION */}
      <Section id="intro" className="border-t border-border/50">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-sm metallic-border">
              <img src={factoryImg} alt="Precision manufacturing facility" loading="lazy" decoding="async" className="h-full w-full object-cover aspect-[4/3]" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 mono-label text-primary">Manufacturing Floor</div>
            </div>
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Who We Are"
              title="Engineering Precision Into Every Component"
              intro="Kotadiya Industries is a manufacturer of precision-engineered CNC components. Our work is built on accuracy, consistent quality, and a commitment to understanding each customer's requirement — from single prototypes to production batches."
            />
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Precision Manufacturing", "Custom Components", "Quality Focus", "Timely Response"].map((t) => (
                  <span key={t} className="mono-label rounded-full border border-border/60 bg-card/60 px-3 py-1.5 !text-foreground/80">
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="mt-10">
                <MagneticButton href="/about" variant="ghost">
                  Discover Kotadiya Industries <ArrowRight size={16} />
                </MagneticButton>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* SECTION 3 — CAPABILITIES */}
      <Section id="capabilities" tint>
        <SectionHeading eyebrow="Capabilities" title="Built Around Manufacturing Capability" intro="Our capabilities are focused on CNC-based precision manufacturing. Each process is engineered to hold accuracy and repeatability across batches." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c: any, i: number) => {
            const Icon = capabilityIcons[i % capabilityIcons.length];
            return (
              <div key={c.title} className="relative">
                <div className="absolute right-6 top-6 text-muted-foreground/40 z-10">
                  <Icon size={20} />
                </div>
                <CapabilityCard title={c.title} body={c.body} index={i} />
              </div>
            );
          })}
        </div>
      </Section>

      {/* SECTION 4 — PRODUCTS */}
      <Section id="products">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Products" title="Precision Components for Industrial Applications" />
          <Reveal>
            <Link to="/products" className="mono-label inline-flex items-center gap-1 !text-primary hover:underline">
              View All Products <ArrowUpRight size={14} />
            </Link>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </Section>

      {/* SECTION 5 — CUSTOM MANUFACTURING CTA */}
      <section className="relative overflow-hidden border-y border-border/50 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <img src={blueprintImg} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/50" />
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Custom Manufacturing"
            title="Have a Component Drawing or Custom Requirement?"
            intro="Share your drawing, specifications, material requirements, and quantity. Our team will review your requirement and contact you regarding manufacturing feasibility and quotation."
          />
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap gap-4">
              <MagneticButton href="/quote" variant="primary">
                <Upload size={16} /> Upload Drawing
              </MagneticButton>
              <MagneticButton href={whatsappHref()} variant="ghost">
                <MessageCircle size={16} /> Talk to Our Team
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 6 — HOW WE WORK */}
      <Section id="process" tint>
        <SectionHeading eyebrow="Process" title="From Requirement to Finished Component" intro="A clear, transparent path from inquiry to delivery." />
        <div className="mt-14">
          <div className="relative">
            <div className="pointer-events-none absolute left-0 right-0 top-6 hidden lg:block">
              <div className="tech-line" />
            </div>
            <ol className="grid gap-6 lg:grid-cols-6">
              {PROCESS_STEPS.map((s: any, i: number) => (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative rounded-sm bg-card p-5 metallic-border"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-primary/15 mono-label !text-primary">
                    {s.n}
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* SECTION 7 — MATERIALS */}
      <Section id="materials">
        <SectionHeading
          eyebrow="Materials"
          title="Materials & Manufacturing Information"
          intro="We work with a range of metals commonly used in precision CNC components. Material selection is confirmed against your drawing and application before quoting."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Mild Steel", "Stainless Steel", "Brass", "Aluminium"].map((m, i) => (
            <motion.div
              key={m}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group rounded-sm bg-card p-6 metallic-border relative overflow-hidden"
              style={{ background: "var(--gradient-metal)" }}
            >
              <div className="mono-label mb-3 !text-primary">Material</div>
              <h3 className="font-display text-xl font-semibold text-foreground">{m}</h3>
              <div className="tech-line mt-4" />
              <p className="mt-4 text-xs text-muted-foreground">Common CNC-machinable grade — final grade confirmed to specification.</p>
            </motion.div>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mt-8 text-sm text-muted-foreground">
            Working with a material not listed here?{" "}
            <Link to="/quote" className="text-primary hover:underline">
              Contact our team to discuss material compatibility for your component.
            </Link>
          </p>
        </Reveal>
      </Section>

      {/* SECTION 8 — INDUSTRIES */}
      <Section id="industries" tint>
        <SectionHeading eyebrow="Industries" title="Supporting Diverse Industrial Requirements" intro="Our components support customers across a range of engineering sectors." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind: any, i: number) => {
            const Icon = industryIcons[i % industryIcons.length];
            return (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group flex items-start gap-4 rounded-sm bg-card p-5 metallic-border transition hover:-translate-y-0.5"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-primary/15 text-primary">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-foreground">{ind.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{ind.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* SECTION 9 — WHY US */}
      <Section id="why">
        <SectionHeading eyebrow="Why Us" title="Why Work With Kotadiya Industries?" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map((w: any, i: number) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-sm bg-card p-6 metallic-border"
            >
              <div className="mono-label mb-4 text-primary">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="font-display text-lg font-semibold text-foreground">{w.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{w.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* SECTION 10 — QUALITY */}
      <Section id="quality" tint>
        <SectionHeading eyebrow="Quality" title="Quality at Every Stage" intro="Quality is the foundation of everything we do — from material review through final dispatch." />
        <div className="mt-14 grid gap-3 md:grid-cols-5">
          {["Material Review", "Manufacturing", "Dimensional Inspection", "Final Review", "Dispatch"].map((s, i, arr) => (
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
      </Section>

      {/* SECTION 11 — GALLERY (placeholders flagged) */}
      <Section id="gallery">
        <SectionHeading eyebrow="Gallery" title="Inside Kotadiya Industries" intro="Machinery, process, and finished components. Replace the placeholder tiles below with real factory photos once available." />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <div key={p.slug} className="group relative aspect-square overflow-hidden rounded-sm bg-[oklch(0.94_0.005_250)] metallic-border">
              <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: p.imagePosition === "top" ? "50% 22%" : "50% 78%", transform: "scale(1.55)" }} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <p className="mono-label !text-[10px] text-primary">{p.name}</p>
              </div>
            </div>
          ))}
          {["Machinery", "Process"].map((label) => (
            <div key={label} className="relative flex aspect-square items-center justify-center rounded-sm bg-card p-4 text-center metallic-border eng-grid-fine">
              <div>
                <div className="mono-label !text-[10px] text-muted-foreground">Editable placeholder</div>
                <p className="mt-2 text-sm font-semibold text-foreground">{label} photo</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 12 — LEAD-GEN CTA */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 eng-grid opacity-40" />
        <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at 50% 50%, oklch(0.705 0.185 45 / 0.15), transparent 55%)" }} />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mono-label mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-primary" /> Let's Work Together <span className="h-px w-8 bg-primary" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-3xl font-bold tracking-tight text-metallic sm:text-5xl">
              Looking for a Reliable Manufacturing Partner?
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground">
              Tell us about your product, component, or custom manufacturing requirement.
              Our team will review your inquiry and get in touch.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton href="/quote" variant="primary">
                Request a Quote <ArrowRight size={16} />
              </MagneticButton>
              <MagneticButton href={whatsappHref()} variant="ghost">
                <MessageCircle size={16} /> Contact on WhatsApp
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 13 — CONTACT PREVIEW */}
      <Section id="contact" tint>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Get In Touch" title="Ready to Discuss Your Requirement?" />
            <ul className="mt-10 space-y-5">
              <ContactRow icon={Phone} label="Phone" value={COMPANY.phone} href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} />
              <ContactRow icon={Mail} label="Email" value={COMPANY.email} href={`mailto:${COMPANY.email}`} />
              <ContactRow icon={MessageCircle} label="WhatsApp" value="Chat with our team" href={whatsappHref()} external />
              <ContactRow icon={MapPin} label="Address" value={COMPANY.address || "Address will be shared on request"} placeholder={!COMPANY.address} />
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="rounded-sm border border-border/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:border-primary hover:text-primary">Call</a>
              <a href={`mailto:${COMPANY.email}`} className="rounded-sm border border-border/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:border-primary hover:text-primary">Email</a>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">WhatsApp</a>
              <Link to="/contact" className="rounded-sm border border-border/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:border-primary hover:text-primary">Get Directions</Link>
            </div>
          </div>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-card p-1 metallic-border">
              <div className="grid h-full w-full place-items-center eng-grid rounded-sm bg-background/80">
                <div className="text-center p-8">
                  <ScrollText size={26} className="mx-auto text-primary" />
                  <p className="mono-label mt-4 text-muted-foreground">Map preview</p>
                  <p className="mt-2 max-w-xs text-sm text-foreground">
                    Google Maps embed will appear here once the office / factory address is confirmed.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

function Section({ id, children, tint = false, className = "" }: { id?: string; children: React.ReactNode; tint?: boolean; className?: string }) {
  return (
    <section id={id} className={`relative py-20 sm:py-28 ${tint ? "bg-[oklch(0.168_0.010_250)]" : ""} ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function ContactRow({ icon: Icon, label, value, href, external, placeholder }: { icon: typeof Phone; label: string; value: string; href?: string; external?: boolean; placeholder?: boolean }) {
  const inner = (
    <li className="flex items-start gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-primary/15 text-primary">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="mono-label !text-[10px] text-muted-foreground">{label}</div>
        <div className={`mt-1 text-base ${placeholder ? "text-muted-foreground italic" : "text-foreground"}`}>{value}</div>
      </div>
    </li>
  );
  return href ? (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block group hover:opacity-90">
      {inner}
    </a>
  ) : inner;
}
