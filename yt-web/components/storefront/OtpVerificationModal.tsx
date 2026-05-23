"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUiStore } from "@/store/uiStore";

interface OtpVerificationModalProps {
  open: boolean;
  phone: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function OtpVerificationModal({ open, phone, onClose, onSuccess }: OtpVerificationModalProps) {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    if (open) {
      // When modal opens, automatically send the OTP
      const sendOtp = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/auth/otp/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to send OTP. Please check the phone number.");
          }
          showToast("An OTP has been sent to your phone.");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to send OTP. Please check the phone number.");
        } finally {
          setIsLoading(false);
        }
      };
      sendOtp();
    }
  }, [open, phone, showToast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, token: token.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify OTP.");
      }
      showToast("Phone number verified!");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border border-brand-border bg-brand-bg p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h2 className="font-playfair text-xl text-brand-text">Verify your phone number</h2>
            <p className="mt-2 font-jost text-sm text-brand-muted">
              We&apos;ve sent a one-time password (OTP) to {phone}. Please enter it below to continue.
            </p>
            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              <label className="block">
                <span className="font-jost text-xs text-brand-dimmed">Verification Code</span>
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="123456"
                  className="mt-1 w-full rounded-lg border border-brand-border bg-brand-elevated px-3 py-2.5 font-jost text-sm text-brand-text outline-none focus:border-brand-pink/50"
                />
              </label>
              {error && <p className="font-jost text-sm text-red-500">{error}</p>}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-brand-border px-5 py-2.5 font-jost text-sm text-brand-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !token.trim()}
                  className="flex-1 rounded-lg bg-brand-pink px-5 py-2.5 font-jost text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}