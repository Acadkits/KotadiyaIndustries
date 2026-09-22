import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MessageCircle, MapPin, ScrollText } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { InquiryForm } from "@/components/site/InquiryForm";
import { MagneticButton } from "@/components/site/MagneticButton";
import { COMPANY as STATIC_COMPANY } from "@/lib/company";
import { useSiteCompany, whatsappHrefFor } from "@/lib/cms-client";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${STATIC_COMPANY.name}` },
      { name: "description", content: "Contact Kotadiya Industries — phone, WhatsApp, email, and general inquiry form for precision manufacturing." },
      { property: "og:title", content: `Contact — ${STATIC_COMPANY.name}` },

      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const COMPANY = useSiteCompany();
  const whatsappHref = () => whatsappHrefFor(COMPANY.phoneDigits);
  return (
    <>

      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 eng-grid opacity-40" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mono-label mb-6 flex items-center gap-3"><span className="h-px w-8 bg-primary" /> Contact</div>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-metallic sm:text-5xl md:text-6xl">
            Let's Discuss Your Requirement.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Whether it's a standard product, custom component, or OEM partnership — we're ready to help.
          </p>
        </div>
      </section>

      <section className="border-t border-border/50 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:px-8">
          <div>
            <SectionHeading eyebrow="Reach Us" title="Contact Details" />
            <ul className="mt-10 space-y-6">
              <ContactItem icon={Phone} label="Phone / WhatsApp" primary={COMPANY.phone} href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} />
              <ContactItem icon={Mail} label="Email" primary={COMPANY.email} href={`mailto:${COMPANY.email}`} />
              <ContactItem icon={MessageCircle} label="WhatsApp" primary="Chat with our team" href={whatsappHref()} external />
              <ContactItem icon={MapPin} label="Address" primary={COMPANY.address || "Address will be shared on request"} placeholder={!COMPANY.address} />
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} variant="ghost">Call</MagneticButton>
              <MagneticButton href={`mailto:${COMPANY.email}`} variant="ghost">Email</MagneticButton>
              <MagneticButton href={whatsappHref()}>WhatsApp</MagneticButton>
            </div>

            <div className="mt-10 relative aspect-[4/3] overflow-hidden rounded-sm bg-card metallic-border">
              <div className="grid h-full w-full place-items-center eng-grid bg-background/80 p-8 text-center">
                <div>
                  <ScrollText size={24} className="mx-auto text-primary" />
                  <p className="mono-label mt-4 text-muted-foreground">Map Preview</p>
                  <p className="mt-2 text-sm text-foreground">Google Maps embed will appear here once the office / factory address is confirmed.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="Inquiry" title="Send Us a Message" />
            <div className="mt-10">
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactItem({ icon: Icon, label, primary, href, external, placeholder }: { icon: typeof Phone; label: string; primary: string; href?: string; external?: boolean; placeholder?: boolean }) {
  const body = (
    <li className="flex items-start gap-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-sm bg-primary/15 text-primary">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="mono-label !text-[10px] text-muted-foreground">{label}</div>
        <div className={`mt-1 text-base ${placeholder ? "italic text-muted-foreground" : "text-foreground"}`}>{primary}</div>
      </div>
    </li>
  );
  return href ? (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block hover:opacity-90">
      {body}
    </a>
  ) : body;
}
