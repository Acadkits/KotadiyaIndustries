"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import heroImg from "@/assets/hero-cnc.jpg";
import { MagneticButton } from "./MagneticButton";
import { useRef } from "react";
import { useSiteContent } from "@/lib/cms-client";

export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const c = useSiteContent("home.hero");

  // Render title supports "Line 1 / Line 2" split with metallic accent on line 2
  const renderTitle = () => {
    const t: string = c.title || "";
    if (t.includes("\n")) {
      const [a, b] = t.split("\n");
      return (<>{a}<br /><span className="text-metallic">{b}</span></>);
    }
    const parts = t.split(/\.\s+/);
    if (parts.length >= 2) {
      return (<>{parts[0]}.<br /><span className="text-metallic">{parts.slice(1).join(". ")}</span></>);
    }
    return t;
  };

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden"
    >
      <motion.div style={reduced ? undefined : { y: bgY }} className="absolute inset-0 -z-20">
        <img
          src={heroImg}
          alt=""
          fetchPriority="high"
          decoding="async"
          width={1920}
          height={1080}
          className="h-full w-full object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/85 via-background/70 to-background" />
      <div className="absolute inset-0 -z-10 eng-grid opacity-60" />
      <div
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, oklch(0.705 0.185 45 / 0.22), transparent 55%)",
        }}
      />

      <motion.div
        style={reduced ? undefined : { opacity }}
        className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mono-label mb-8 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-primary" />
          {c.eyebrow}
        </motion.div>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {renderTitle()}
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {c.subtitle}
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton href="/quote" variant="primary">
            {c.ctaPrimary || "Request a Quote"} <ArrowRight size={16} />
          </MagneticButton>
          <MagneticButton href="/capabilities" variant="ghost">
            {c.ctaSecondary || "Explore Our Capabilities"}
          </MagneticButton>
        </motion.div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="mono-label mt-12 text-muted-foreground"
        >
          Custom Manufacturing • Precision Components • B2B Solutions
        </motion.p>
      </motion.div>

      <motion.div
        aria-hidden
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="mono-label !text-[9px]">Scroll</span>
        <motion.div
          animate={reduced ? undefined : { y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ArrowDown size={14} />
        </motion.div>
      </motion.div>
    </section>
  );
}
