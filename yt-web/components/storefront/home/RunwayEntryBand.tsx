"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function RunwayEntryBand() {
  return (
    <motion.section
      className="relative overflow-hidden py-24 md:py-32"
      animate={{ backgroundColor: ["#111111", "#181818", "#111111"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative z-[1] mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="font-bebas text-4xl tracking-[0.35em] text-white md:text-5xl">INSPO</p>
        <p className="mt-4 font-jost text-white/70">
          Experience the collection like never before — full screen, swipe, wear it.
        </p>
        <Link
          href="/runway"
          className="mt-10 inline-block rounded-lg bg-brand-pink px-10 py-4 font-jost text-sm font-semibold text-black hover:bg-brand-pink-hover"
        >
          Open inspo →
        </Link>
      </div>
    </motion.section>
  );
}
