"use client";

import { motion } from "framer-motion";
import { choice } from "@/lib/choiceStyles";
import type { CatalogProduct } from "@/types/product";

export function ProductDropSpotlight({ product }: { product: CatalogProduct }) {
  const total = product.sizes.reduce((n, s) => n + s.stock, 0);
  const scarcity = total > 0 && total <= 8;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-xl border border-[var(--border-pink)] bg-gradient-to-br from-[var(--surface-card-soft)] to-[var(--surface-tint)] p-5 shadow-sm"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[10px] border border-brand-pink/20"
        animate={{
          opacity: [0.25, 0.55, 0.25],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <div className="relative">
        <p className="font-bebas text-xs tracking-[0.35em] text-brand-pink">ATELIER NOTE</p>
        <p className="mt-2 font-playfair text-lg text-brand-text">
          {scarcity
            ? `Only ${total} left in this drop — don’t sleep on it.`
            : "Hand-checked before it leaves Dansoman."}
        </p>
        <p className="mt-3 font-jost text-sm leading-relaxed text-brand-muted">
          Pair with{" "}
          <span className="font-medium text-brand-text">
            {product.mood_tags.slice(0, 2).join(" · ") || "your favourite heels"}
          </span>{" "}
          for the full Yanney moment.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.occasion_tags.slice(0, 3).map((tag) => (
            <span key={tag} className={`${choice.chip(false)} cursor-default uppercase tracking-wide`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
