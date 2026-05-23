"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { fadeUp } from "@/lib/motion";
import { buildWhatsAppPrefill } from "@/lib/whatsapp";
import { SHOP_WHATSAPP } from "@/lib/constants";

const delays = [0, 0.12, 0.24, 0.36, 0.48];

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=1600&fit=crop",
    alt: "Yanney Trendss editorial look one",
  },
  {
    src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&h=1600&fit=crop",
    alt: "Yanney Trendss editorial look two",
  },
  {
    src: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=1600&fit=crop",
    alt: "Yanney Trendss editorial look three",
  },
];

const SLIDE_MS = 5000;

export function HeroSection() {
  const wa = buildWhatsAppPrefill(
    "Hello Yanney Trendss, I'd love to shop your new collection. Can you help me pick a size?",
    SHOP_WHATSAPP,
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-brand-surface via-brand-bg to-brand-elevated">
      <div className="grain-overlay pointer-events-none absolute inset-0 z-[1] opacity-[0.35]" />

      <div className="relative z-[2] mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-4 py-24 lg:grid-cols-2 lg:gap-16 sm:px-6 lg:px-8">
        <div>
          {[
            <p
              key="e"
              className="font-bebas text-sm tracking-[0.28em] text-brand-pink"
            >
              DANSOMAN · ACCRA · GHANA · EST. 2024
            </p>,
            <h1
              key="h"
              className="mt-6 font-playfair text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] text-brand-text"
            >
              Style That Speaks Before You Do
            </h1>,
            <p key="s" className="mt-6 max-w-md font-jost text-lg text-brand-muted">
              A curated women&apos;s boutique for dresses, sets, bags, and heels — editorial
              quality, Ghana-first service, effortless ordering.
            </p>,
            <div key="c" className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-lg bg-brand-pink px-8 py-3.5 font-jost text-sm font-semibold text-white hover:bg-brand-pink-hover"
              >
                Shop collection
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-brand-border bg-brand-elevated/70 px-8 py-3.5 font-jost text-sm text-brand-text backdrop-blur-sm transition-colors hover:border-brand-pink hover:text-brand-pink"
              >
                Chat on WhatsApp
              </a>
            </div>,
          ].map((node, i) => (
            <motion.div
              key={i}
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ ...fadeUp.transition, delay: delays[i] }}
            >
              {node}
            </motion.div>
          ))}
        </div>

        <div className="relative min-h-[420px] lg:min-h-[min(80vh,720px)]">
          <div className="absolute bottom-0 left-0 top-0 z-10 w-1 bg-brand-pink" aria-hidden />
          <div className="relative ml-2 h-full min-h-[420px] overflow-hidden rounded-lg lg:min-h-[min(80vh,720px)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={HERO_IMAGES[index].src}
                  alt={HERO_IMAGES[index].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 50vw"
                  priority={index === 0}
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-8 bg-brand-pink" : "w-2 bg-brand-muted/40 hover:bg-brand-muted/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
