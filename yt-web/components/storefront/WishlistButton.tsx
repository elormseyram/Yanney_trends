"use client";

import { motion } from "framer-motion";
import { useWishlistStore } from "@/store/wishlistStore";

export function WishlistButton({
  productId,
  className = "",
  variant = "default",
}: {
  productId: string;
  className?: string;
  variant?: "default" | "circle";
}) {
  const toggle = useWishlistStore((s) => s.toggle);
  const active = useWishlistStore((s) => s.ids.includes(productId));

  const base =
    variant === "circle"
      ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-white shadow-sm"
      : "rounded-full border border-brand-border bg-brand-bg p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]";

  return (
    <motion.button
      type="button"
      onClick={() => toggle(productId)}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`${base} ${className}`}
      whileTap={{ scale: 0.88 }}
      animate={{ scale: active ? [1, 1.12, 1] : 1 }}
      transition={{ duration: 0.35 }}
    >
      <span className={`text-lg leading-none ${active ? "text-brand-pink" : "text-brand-muted"}`} aria-hidden>
        {active ? "♥" : "♡"}
      </span>
    </motion.button>
  );
}
