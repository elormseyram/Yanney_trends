"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const shots = [
  { src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop", caption: "Evening line", slug: "editorial-midi-dress" },
  { src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop", caption: "City nights", slug: "structured-blazer-set" },
  { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop", caption: "Soft tailoring", slug: "minimal-shift-dress" },
  { src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop", caption: "Weekend", slug: "two-piece-linen-set" },
  { src: "https://images.unsplash.com/photo-1550614000-4b9519e02a4d?w=600&h=600&fit=crop", caption: "Accessories", slug: "woven-clutch-onyx" },
];

export function LookbookStrip() {
  return (
    <section className="border-y border-brand-border bg-brand-bg py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-bebas text-3xl tracking-wide text-brand-text">LOOKBOOK</h2>
        <p className="mt-2 font-jost text-sm text-brand-muted">Scroll — tap a look to shop.</p>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
          {shots.map((s, i) => (
            <motion.div
              key={i}
              className="relative w-[min(72vw,280px)] shrink-0 snap-center"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.35 }}
            >
              <Link href={`/product/${s.slug}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-elevated">
                  <Image src={s.src} alt={s.caption} fill className="object-cover" sizes="280px" />
                  <div className="absolute inset-0 flex flex-col justify-end bg-[rgba(0,0,0,0)] p-4 opacity-0 transition-opacity duration-300 group-hover:bg-[rgba(0,0,0,0.45)] group-hover:opacity-100">
                    <p className="font-playfair text-white">{s.caption}</p>
                    <p className="mt-1 font-jost text-xs text-white/90">Shop this look →</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
