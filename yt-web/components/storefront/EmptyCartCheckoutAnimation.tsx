"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function EmptyCartCheckoutAnimation() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.svg
          className="h-32 w-32 text-brand-pink"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M8 12h6l4 28h32l6-20H18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="48" r="3" fill="currentColor" stroke="none" />
          <circle cx="44" cy="48" r="3" fill="currentColor" stroke="none" />
          <motion.path
            d="M14 12V8a4 4 0 0 1 4-4h2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.5 }}
          />
        </motion.svg>
        <motion.span
          className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand-pink bg-[#fffafd] font-jost text-xs font-bold text-brand-text"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.1, 1] }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          0
        </motion.span>
      </motion.div>
      <p className="mt-8 max-w-sm text-center font-playfair text-2xl text-brand-text dark:text-stone-100">
        Your bag is waiting to be filled
      </p>
      <p className="mt-2 max-w-md text-center font-jost text-sm text-brand-muted dark:text-stone-400">
        Browse the collection and add pieces you love — your cart is ready when you are.
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-flex rounded-xl border border-brand-pink bg-[#fffafd] px-8 py-3.5 font-jost text-sm font-semibold text-brand-text transition hover:bg-brand-pink-muted dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
      >
        Shop the collection
      </Link>
    </div>
  );
}
