"use client";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function CapabilityCard({ title, body, index }: { title: string; body: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className="group relative flex h-full flex-col rounded-sm bg-card p-6 metallic-border sm:p-7"
    >
      <div className="mono-label mb-6 text-primary">{String(index + 1).padStart(2, "0")}</div>
      <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-auto pt-6">
        <Link
          to="/quote"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-transform group-hover:translate-x-1"
        >
          Discuss Your Requirement <ArrowRight size={14} />
        </Link>
      </div>
      <div className="absolute top-0 right-0 h-8 w-8 border-t border-r border-primary/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-primary/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}
