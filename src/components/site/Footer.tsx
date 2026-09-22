import { Link } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { useSiteCompany, whatsappHrefFor } from "@/lib/cms-client";
import logo from "@/assets/brand/logo.png";


export function Footer() {
  const COMPANY = useSiteCompany();
  const wa = whatsappHrefFor(COMPANY.phoneDigits);
  return (
    <footer className="relative border-t border-border/60 bg-background pt-20 pb-32 lg:pb-16">
      <div className="absolute inset-x-0 top-0 tech-line" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-sm bg-white metallic-border overflow-hidden">
                <img src={logo} alt="" className="h-9 w-9 object-contain" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                {COMPANY.name.toUpperCase()}
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Precision-engineered CNC components manufactured with a strong focus
              on accuracy, quality, and reliable partnership.
            </p>
            <p className="mono-label mt-6 !text-primary/80">{COMPANY.tagline}</p>
          </div>

          <div>
            <h4 className="mono-label mb-5 text-foreground">Explore</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary">About</Link></li>
              <li><Link to="/capabilities" className="hover:text-primary">Capabilities</Link></li>
              <li><Link to="/products" className="hover:text-primary">Products</Link></li>
              <li><Link to="/industries" className="hover:text-primary">Industries</Link></li>
              <li><Link to="/quality" className="hover:text-primary">Quality</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mono-label mb-5 text-foreground">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/quote" className="hover:text-primary">Request a Quote</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mono-label mb-5 text-foreground">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-1 shrink-0 text-primary" />
                <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-primary">{COMPANY.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-1 shrink-0 text-primary" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-primary break-all">{COMPANY.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle size={14} className="mt-1 shrink-0 text-primary" />
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <p className="mono-label !text-[10px]">Precision • Quality • Capability • Reliability</p>
        </div>
      </div>
    </footer>
  );
}

