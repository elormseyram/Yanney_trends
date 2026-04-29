"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CHECKOUT_TERMS_SECTIONS } from "@/lib/checkoutTerms";

interface TermsBeforePaymentModalProps {
  open: boolean;
  initialEmail: string;
  onClose: () => void;
  onAccept: (acceptanceEmail: string) => void;
}

/** Brand-aligned panel — pink borders, light surfaces; works in dark mode. */
export function TermsBeforePaymentModal({
  open,
  initialEmail,
  onClose,
  onAccept,
}: TermsBeforePaymentModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(initialEmail);
      setAgree(false);
    }
  }, [open, initialEmail]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = emailOk && agree;

  const field =
    "mt-1.5 w-full rounded-lg border border-brand-pink/60 bg-brand-elevated px-3 py-2.5 font-jost text-sm text-brand-text outline-none placeholder:text-brand-muted transition focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/15";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 bg-black/50 dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-scroll-title"
            className="relative z-[201] my-auto w-full max-w-[min(100%,26rem)] sm:max-w-xl"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="relative mx-0 max-h-[min(82dvh,680px)] overflow-y-auto overscroll-contain rounded-2xl border-2 border-brand-pink bg-gradient-to-b from-[var(--surface-card-soft)] via-brand-elevated to-[var(--surface-tint)] px-4 pb-5 pt-6 sm:mx-1 sm:px-6 sm:pb-6 sm:pt-8">
              <div className="flex items-start justify-between gap-3 border-b border-brand-pink/40 pb-3">
                <div>
                  <p className="font-jost text-[10px] uppercase tracking-[0.28em] text-brand-pink">
                    Before payment
                  </p>
                  <h2
                    id="terms-scroll-title"
                    className="mt-1 font-playfair text-lg text-brand-text sm:text-xl"
                  >
                    Terms &amp; conditions
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-lg border border-brand-pink/60 px-2.5 py-1 font-jost text-sm text-brand-muted transition hover:border-brand-pink hover:bg-brand-pink/10"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-brand-pink/30 bg-brand-elevated/80 p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {CHECKOUT_TERMS_SECTIONS.map((sec) => (
                    <section key={sec.title}>
                      <h3 className="font-jost text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-pink">
                        {sec.title}
                      </h3>
                      <p className="mt-1.5 font-jost text-[11px] leading-relaxed text-brand-text">
                        {sec.body}
                      </p>
                    </section>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="font-jost text-[10px] font-medium uppercase tracking-wider text-brand-dimmed">
                    Email (confirms acceptance)
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className={field}
                  />
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-pink/40 bg-[var(--surface-tint)] p-3">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 rounded border-brand-pink text-brand-pink focus:ring-brand-pink/30"
                  />
                  <span className="font-jost text-[11px] leading-snug text-brand-text">
                    I have read and agree to these terms. I understand my order is subject to stock and
                    payment confirmation.
                  </span>
                </label>
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => onAccept(email.trim())}
                  className="w-full rounded-xl border border-brand-pink bg-brand-pink py-3 font-jost text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-brand-pink-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Accept &amp; continue to payment
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-lg py-2 font-jost text-xs text-brand-muted hover:text-brand-text"
                >
                  Go back
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
