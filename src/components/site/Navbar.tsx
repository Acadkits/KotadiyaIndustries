"use client";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSiteCompany } from "@/lib/cms-client";
import logo from "@/assets/brand/logo.png";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/capabilities", label: "Capabilities" },
  { to: "/products", label: "Products" },
  { to: "/industries", label: "Industries" },
  { to: "/quality", label: "Quality" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const COMPANY = useSiteCompany();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 group"
          onClick={() => setOpen(false)}
        >
          <div className="grid h-9 w-9 place-items-center rounded-sm bg-white metallic-border overflow-hidden">
            <img src={logo} alt="" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
              {COMPANY.name.toUpperCase()}
            </span>
            <span className="mono-label !text-[9px] !tracking-[0.22em] text-muted-foreground">
              Precision Engineering
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="relative px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/quote"
            className="hidden sm:inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
          >
            Request a Quote
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-sm border border-border/70 text-foreground lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-md"
          >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <ul className="flex flex-col divide-y divide-border/50">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: l.to === "/" }}
                      className="flex items-center justify-between py-4 text-base font-medium text-foreground data-[status=active]:text-primary"
                    >
                      <span>{l.label}</span>
                      <span className="mono-label !text-[9px] text-muted-foreground">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/quote"
                onClick={() => setOpen(false)}
                className="mt-6 flex items-center justify-center rounded-sm bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
              >
                Request a Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
