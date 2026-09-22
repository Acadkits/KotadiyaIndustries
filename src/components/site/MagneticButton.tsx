"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export function MagneticButton({
  children,
  className,
  href,
  onClick,
  variant = "primary",
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    ref.current.style.transform = `translate(${x * 0.18}px, ${y * 0.24}px)`;
  };
  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0)";
  };

  const base =
    "group relative inline-flex items-center gap-3 px-6 py-3.5 font-medium text-sm tracking-wide uppercase transition-colors will-change-transform";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border/70 text-foreground hover:border-primary hover:text-primary bg-transparent";

  const inner = (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={cn(base, styles, "rounded-sm", className)}
      style={{ transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1)" }}
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );

  return href ? (
    <a href={href} aria-label={ariaLabel} className="inline-block">
      {inner}
    </a>
  ) : (
    inner
  );
}
