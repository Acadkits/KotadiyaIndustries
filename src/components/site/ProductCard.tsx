"use client";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/company";

export function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="group relative overflow-hidden rounded-sm bg-card metallic-border"
    >
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[oklch(0.94_0.005_250)]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            style={{
              objectPosition:
                product.imagePosition === "top" ? "50% 22%" : "50% 78%",
              transform: "scale(1.55)",
            }}
          />
          {/* Tech overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 translate-y-4 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="mono-label mb-1">Precision Component</div>
            <p className="text-xs text-foreground/90 line-clamp-2">{product.blurb}</p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {product.name}
            </h3>
            <ArrowUpRight
              size={18}
              className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            />
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {product.blurb}
          </p>
          <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
            <span className="mono-label !text-[10px] text-muted-foreground">
              View Details
            </span>
            <Link
              to="/quote"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              Request Quote →
            </Link>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
