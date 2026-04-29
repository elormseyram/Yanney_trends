"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const editorialImg =
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop";

export function StylistTeaserSection() {
  return (
    <section className="border-t border-brand-border bg-brand-bg py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="relative aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-2xl border border-brand-border">
            <Image
              src={editorialImg}
              alt="Editorial styling"
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-playfair text-3xl text-brand-text md:text-4xl">
            Your stylist, on demand
          </h2>
          <p className="mt-4 font-jost text-brand-muted">
            Occasion, mood, fit, colour, budget — we surface pieces that match your life in Accra and
            beyond.
          </p>
          <Link
            href="/stylist"
            className="mt-8 inline-block rounded-xl border border-brand-pink bg-[var(--surface-card-soft)] px-8 py-3.5 font-jost text-sm font-semibold text-brand-text transition-colors hover:bg-brand-pink-muted"
          >
            Get styled
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
