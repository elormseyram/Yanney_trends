"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrackOrderLottie } from "@/components/storefront/TrackOrderLottie";

export function TrackOrderLookup({ initial }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? "");
  const showIntro = !value.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim().replace(/\s+/g, "-");
    if (!v) return;
    router.push(`/track/${encodeURIComponent(v)}`);
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-8 max-w-md">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="lottie"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-2 overflow-hidden"
          >
            <p className="mb-3 font-jost text-xs text-brand-muted">
              Your order is on its way — look up status with your reference.
            </p>
            <TrackOrderLottie />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <label className="block text-left">
        <span className="font-jost text-[10px] uppercase tracking-[0.2em] text-brand-muted">
          Order number
        </span>
        <div className="mt-2 flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. YT-20260403-1234"
            className="min-w-0 flex-1 rounded-xl border border-brand-border bg-brand-elevated px-4 py-3 font-jost text-sm text-brand-text outline-none focus:border-brand-pink/50"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl border border-brand-pink bg-[var(--surface-card-soft)] px-5 py-3 font-jost text-sm font-semibold text-brand-text transition hover:bg-brand-pink-muted"
          >
            Track
          </button>
        </div>
      </label>
    </form>
  );
}
