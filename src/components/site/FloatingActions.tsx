import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, FileText } from "lucide-react";
import { useSiteCompany, whatsappHrefFor } from "@/lib/cms-client";

export function FloatingActions() {
  const COMPANY = useSiteCompany();
  const whatsappHref = () => whatsappHrefFor(COMPANY.phoneDigits);

  return (
    <>
      {/* Desktop floating WhatsApp */}
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-6 right-6 z-40 hidden items-center gap-3 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-black shadow-2xl transition hover:scale-105 lg:inline-flex"
        aria-label="Discuss your requirement on WhatsApp"
      >
        <MessageCircle size={18} />
        <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-xs group-hover:opacity-100">
          Discuss Your Requirement
        </span>
      </a>

      {/* Mobile bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-border/70 bg-background/95 backdrop-blur-md lg:hidden">
        <a
          href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
          className="flex flex-col items-center justify-center gap-1 py-3 text-xs text-foreground"
          aria-label="Call Kotadiya Industries"
        >
          <Phone size={16} className="text-primary" />
          Call
        </a>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 border-x border-border/60 py-3 text-xs text-foreground"
        >
          <MessageCircle size={16} className="text-primary" />
          WhatsApp
        </a>
        <Link
          to="/quote"
          className="flex flex-col items-center justify-center gap-1 bg-primary py-3 text-xs font-semibold text-primary-foreground"
        >
          <FileText size={16} />
          Quote
        </Link>
      </div>
    </>
  );
}
