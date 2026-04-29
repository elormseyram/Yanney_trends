"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const quotes = [
  {
    name: "Ama K.",
    city: "East Legon",
    text: "The drape on my set is unreal — Yanney actually replies on WhatsApp when you need sizing help.",
  },
  {
    name: "Kojo T.",
    city: "Cantonments",
    text: "Ordered for my partner; the packaging felt boutique, not like a random website.",
  },
  {
    name: "Efua M.",
    city: "Tema",
    text: "Delivery was on time and the fabric matched the runway shots. Already eyeing the next drop.",
  },
] as const;

export function TestimonialsSection() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % quotes.length), 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="border-t border-brand-border bg-brand-surface py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <p className="font-jost text-[10px] uppercase tracking-[0.3em] text-brand-muted">
          Real voices
        </p>
        <h2 className="mt-2 font-playfair text-3xl text-brand-text sm:text-4xl">
          Loved in <span className="italic text-brand-pink">Accra</span> and beyond
        </h2>
        <div className="relative mt-10 min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={quotes[i].name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="border border-brand-border bg-brand-elevated p-8"
            >
              <p className="font-jost text-sm leading-relaxed text-brand-text">
                &ldquo;{quotes[i].text}&rdquo;
              </p>
              <footer className="mt-6 border-t border-brand-border pt-4">
                <p className="font-jost text-sm font-medium text-brand-text">{quotes[i].name}</p>
                <p className="font-jost text-xs text-brand-muted">{quotes[i].city}</p>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {quotes.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                idx === i ? "bg-brand-pink" : "bg-brand-border"
              }`}
              aria-label={`Show testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
