"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const items = [
  {
    title: "Nationwide delivery",
    sub: "We ship across Ghana",
    detail:
      "Orders outside Greater Accra ship with trusted couriers. Tracking is shared by SMS or WhatsApp once your package leaves the boutique.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
        <path d="M4 16h2l1-4h9l2 4h2" strokeLinejoin="round" />
        <circle cx="8.5" cy="18.5" r="1.5" />
        <circle cx="17.5" cy="18.5" r="1.5" />
        <path d="M7 16h10l-1-6H8L7 16Z" />
      </svg>
    ),
  },
  {
    title: "Dansoman pickup",
    sub: "Collect in boutique",
    detail:
      "Skip delivery fees — book a pickup slot and try your pieces in person. Bring your order reference and a valid ID.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
        <path d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z" strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Bulk purchase",
    sub: "Wholesale & event orders",
    detail:
      "Ordering several units or styling a wedding or shoot? Message us with quantities and dates — we’ll quote bundle pricing and hold stock where possible.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
        <path d="M4 7h4l2-3h4l2 3h4v12H4V7Z" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Secure payment",
    sub: "Paystack",
    detail:
      "Pay securely with Paystack. We never ask for your PIN over chat — only official Paystack steps.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
] as const;

export function DeliveryPromiseStrip() {
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected !== null ? items[selected] : null;

  return (
    <section className="border-t border-brand-border bg-brand-surface py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="grid flex-1 grid-cols-2 gap-3 sm:gap-4 lg:max-w-2xl">
            {items.map((it, i) => (
              <motion.button
                key={it.title}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                onClick={() => setSelected(i)}
                className={`flex flex-col items-center rounded-xl border bg-brand-elevated px-3 py-6 text-center transition-colors sm:px-4 ${
                  selected === i
                    ? "border-brand-pink ring-2 ring-brand-pink/30"
                    : "border-brand-border hover:border-brand-pink/40"
                }`}
              >
                <div className="flex justify-center text-brand-text">{it.icon}</div>
                <p className="mt-3 font-jost text-sm font-medium text-brand-text">{it.title}</p>
                <p className="mt-1 font-jost text-xs text-brand-muted">{it.sub}</p>
              </motion.button>
            ))}
          </div>

          <motion.div
            layout
            className="flex min-h-[180px] w-full flex-1 flex-col justify-center rounded-xl border border-brand-border bg-brand-elevated p-6 lg:mx-auto lg:max-w-md lg:self-center"
          >
            {active ? (
              <>
                <p className="font-playfair text-xl text-brand-text">{active.title}</p>
                <p className="mt-3 font-jost text-sm leading-relaxed text-brand-muted">
                  {active.detail}
                </p>
              </>
            ) : (
              <p className="text-center font-jost text-sm text-brand-muted">
                Select a card to see details.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
