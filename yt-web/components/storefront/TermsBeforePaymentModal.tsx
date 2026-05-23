"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CHECKOUT_TERMS_SECTIONS } from "@/lib/checkoutTerms";

interface TermsBeforePaymentModalProps {
  open: boolean;
  phone: string;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsBeforePaymentModal({ open, phone, onClose, onAccept }: TermsBeforePaymentModalProps) {
  const [agree, setAgree] = useState(false);
  const [step, setStep] = useState<"terms" | "otp">("terms");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAgree(false);
      setStep("terms");
      setOtp("");
      setError(null);
    }
  }, [open]);

  async function handleSendOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send OTP.");
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, token: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code. Please try again.");
      onAccept();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
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
            aria-labelledby="terms-title"
            className="relative z-[201] my-auto w-full max-w-[min(100%,26rem)] sm:max-w-xl"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="relative mx-0 max-h-[min(82dvh,680px)] overflow-y-auto overscroll-contain rounded-2xl border-2 border-brand-pink bg-gradient-to-b from-[var(--surface-card-soft)] via-brand-elevated to-[var(--surface-tint)] px-4 pb-5 pt-6 sm:mx-1 sm:px-6 sm:pb-6 sm:pt-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-brand-pink/40 pb-3">
                <div>
                  <p className="font-jost text-[10px] uppercase tracking-[0.28em] text-brand-pink">
                    Before payment
                  </p>
                  <h2 id="terms-title" className="mt-1 font-playfair text-lg text-brand-text sm:text-xl">
                    {step === "terms" ? "Terms & conditions" : "Verify your number"}
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

              {step === "terms" && (
                <>
                  {/* Terms scroll */}
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
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-pink/40 bg-[var(--surface-tint)] p-3">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="mt-0.5 rounded border-brand-pink text-brand-pink focus:ring-brand-pink/30"
                      />
                      <span className="font-jost text-[11px] leading-snug text-brand-text">
                        I have read and agree to these terms. I understand my order is subject to
                        stock and payment confirmation.
                      </span>
                    </label>

                    {error && (
                      <p className="font-jost text-sm text-red-500">{error}</p>
                    )}

                    <button
                      type="button"
                      disabled={!agree || loading}
                      onClick={handleSendOtp}
                      className="w-full rounded-xl border border-brand-pink bg-brand-pink py-3 font-jost text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-brand-pink-hover disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {loading ? "Sending..." : `Send OTP to ${phone}`}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full rounded-lg py-2 font-jost text-xs text-brand-muted hover:text-brand-text"
                    >
                      Go back
                    </button>
                  </div>
                </>
              )}

              {step === "otp" && (
                <div className="mt-5 space-y-4">
                  <p className="font-jost text-sm text-brand-muted">
                    We sent a code to <span className="font-semibold text-brand-text">{phone}</span>.
                    Enter it below to confirm your order.
                  </p>

                  <label className="block">
                    <span className="font-jost text-[10px] font-medium uppercase tracking-wider text-brand-dimmed">
                      One-time code
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className={inputCls}
                      autoFocus
                    />
                  </label>

                  {error && (
                    <p className="font-jost text-sm text-red-500">{error}</p>
                  )}

                  <button
                    type="button"
                    disabled={!otp.trim() || loading}
                    onClick={handleVerifyOtp}
                    className="w-full rounded-xl border border-brand-pink bg-brand-pink py-3 font-jost text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-brand-pink-hover disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? "Verifying..." : "Verify & proceed to payment"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep("terms"); setError(null); }}
                    className="w-full rounded-lg py-2 font-jost text-xs text-brand-muted hover:text-brand-text"
                  >
                    Resend code
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
