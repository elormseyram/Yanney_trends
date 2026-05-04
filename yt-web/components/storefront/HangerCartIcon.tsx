"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";

export function HangerCartIcon({ onClick }: { onClick: () => void }) {
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const lastAddedAt = useCartStore((s) => s.lastAddedAt);
  const cartPulse = useUiStore((s) => s.cartPulse);
  const setCartPulse = useUiStore((s) => s.setCartPulse);
  const swing = useAnimation();

  useEffect(() => {
    if (!lastAddedAt) return;
    void swing.start({
      rotate: [0, -3, 2, -1.5, 0],
      transition: { duration: 0.55, ease: "easeInOut" },
    });
    setCartPulse(true);
    const t = window.setTimeout(() => setCartPulse(false), 550);
    return () => clearTimeout(t);
    // Only when a new item is added — do not list `swing`; its identity can change every render and retrigger this effect (infinite updates).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAddedAt]);

  return (
    <motion.button
      id="nav-cart-anchor"
      type="button"
      onClick={onClick}
      className={`relative rounded-lg p-1.5 text-brand-text outline-none ring-brand-pink transition-shadow focus-visible:ring-2 dark:text-neutral-100 ${
        cartPulse ? "ring-2 ring-brand-pink/45 ring-offset-2 ring-offset-brand-bg dark:ring-offset-neutral-950" : ""
      }`}
      aria-label="Open cart"
    >
      <motion.span
        animate={swing}
        className="inline-flex items-center justify-center"
        style={{ transformOrigin: "50% 12%" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6 text-current sm:h-7 sm:w-7"
          aria-hidden
        >
          <path
            d="M4 6h2l2.1 9.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 1.9-1.4L21 9H8.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 20a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 11 20Zm7 0a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 18 20Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </motion.span>
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded border border-brand-border bg-white px-0.5 font-jost text-[9px] font-semibold text-brand-text dark:bg-neutral-900 dark:text-neutral-100">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </motion.button>
  );
}
