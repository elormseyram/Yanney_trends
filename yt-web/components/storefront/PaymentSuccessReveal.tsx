"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { InvoiceReceipt, type ReceiptOrder } from "@/components/storefront/InvoiceReceipt";
import { OrderTracker, type TrackerFulfillment } from "@/components/storefront/OrderTracker";

type Stage = "celebrate" | "invoice" | "tracker";

interface PaymentSuccessRevealProps {
  order: ReceiptOrder;
  fulfillment: TrackerFulfillment;
  currentStatus: string;
  surprise?: boolean;
}

/**
 * Post-payment experience.
 *  1. "celebrate"  — animated check + "Payment received" message
 *  2. "invoice"    — receipt fades in with a "Track order" button
 *  3. "tracker"    — receipt + OrderTracker timeline
 */
export function PaymentSuccessReveal({
  order,
  fulfillment,
  currentStatus,
  surprise,
}: PaymentSuccessRevealProps) {
  const [stage, setStage] = useState<Stage>("celebrate");

  useEffect(() => {
    if (stage !== "celebrate") return;
    const t = window.setTimeout(() => setStage("invoice"), 2400);
    return () => window.clearTimeout(t);
  }, [stage]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {stage === "celebrate" ? (
          <CelebrationStage key="celebrate" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-6"
          >
            <PaymentSummaryStrip />
            <InvoiceReceipt order={order} />

            {stage === "invoice" ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col items-center gap-2 pt-2"
              >
                <button
                  type="button"
                  onClick={() => setStage("tracker")}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-pink px-6 py-3.5 font-jost text-sm font-semibold text-white shadow-sm transition hover:bg-brand-pink-hover sm:w-auto sm:px-10"
                >
                  Track order
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
                <p className="font-jost text-xs text-brand-muted">
                  Open the live progress for order {order.order_number}.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <OrderTracker
                  fulfillment={fulfillment}
                  currentStatus={currentStatus}
                  surprise={surprise}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaymentSummaryStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <p className="font-jost text-sm font-medium text-emerald-900 dark:text-emerald-200">
          Payment received
        </p>
        <p className="font-jost text-xs text-emerald-800/80 dark:text-emerald-200/80">
          Your order is confirmed. We&apos;ll be in touch by WhatsApp.
        </p>
      </div>
    </motion.div>
  );
}

function CelebrationStage() {
  return (
    <motion.div
      key="celebrate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }}
      className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-pink)] bg-gradient-to-br from-[var(--surface-card-soft)] via-[var(--surface-tint-deep)] to-[var(--surface-tint)] p-10 text-center"
    >
      <PaperConfetti />

      <motion.div
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: [0, 1.15, 1], rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.svg
          className="relative h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <motion.path
            d="m5 12 5 5L20 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          />
        </motion.svg>
      </motion.div>

      <motion.p
        className="mt-6 font-bebas text-xs tracking-[0.4em] text-brand-pink"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        PAYMENT CONFIRMED
      </motion.p>
      <motion.h2
        className="mt-3 font-playfair text-3xl text-brand-text md:text-4xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        Thank you. Your style is on its way.
      </motion.h2>
      <motion.p
        className="mt-3 max-w-md font-jost text-sm text-brand-muted"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        Your invoice is being prepared…
      </motion.p>

      <motion.div
        className="mt-8 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05 }}
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-brand-pink"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

/** Lightweight paper-confetti — pure CSS / framer, no extra deps. */
function PaperConfetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  const colors = ["#FF2E88", "#FFB6C9", "#FFD3DD", "#34D399", "#FBBF24", "#A78BFA"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((i) => {
        const left = (i * 17 + 5) % 95;
        const delay = (i % 6) * 0.1;
        const rotate = (i * 47) % 360;
        const size = 6 + (i % 4) * 2;
        const color = colors[i % colors.length];
        return (
          <motion.span
            key={i}
            className="absolute top-0 block rounded-[1px]"
            style={{
              left: `${left}%`,
              width: size,
              height: size + 4,
              backgroundColor: color,
              transform: `rotate(${rotate}deg)`,
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{
              y: ["-20%", "120%"],
              opacity: [0, 1, 1, 0],
              rotate: [rotate, rotate + 540],
            }}
            transition={{
              duration: 2.6,
              delay,
              ease: "easeIn",
            }}
          />
        );
      })}
    </div>
  );
}
