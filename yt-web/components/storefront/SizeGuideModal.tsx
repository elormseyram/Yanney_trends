"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FitPreference } from "@/lib/sizeRecommendation";
import { recommendSize } from "@/lib/sizeRecommendation";
import { SIZE_GUIDE_ROWS } from "@/lib/sizeGuideData";
import { SITE_EMAIL } from "@/lib/site";

const STORAGE_KEY = "yanney-ai-size-rec";

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  onApplySize?: (size: string) => void;
}

export function SizeGuideModal({ open, onClose, onApplySize }: SizeGuideModalProps) {
  const [height, setHeight] = useState("165");
  const [fit, setFit] = useState<FitPreference>("regular");
  const [usual, setUsual] = useState("M");
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const j = JSON.parse(raw) as { size: string };
        if (j.size) setResult(j.size);
      }
    } catch {
      /* ignore */
    }
  }, [open]);

  const run = () => {
    const h = Math.max(120, Math.min(210, Number(height) || 165));
    const rec = recommendSize({ heightCm: h, fit, usualSize: usual });
    setResult(rec);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ size: rec, at: Date.now() }));
    } catch {
      /* ignore */
    }
    onApplySize?.(rec);
  };

  const field =
    "mt-1.5 w-full rounded-lg border border-brand-border bg-brand-elevated px-3 py-2.5 font-jost text-sm text-brand-text outline-none transition focus:border-brand-pink/50";

  return (
    <AnimatePresence>
      {open ? (
        <>
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-4">
            <motion.button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/40 dark:bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="size-guide-title"
              className="relative z-[1] flex max-h-[min(72dvh,560px)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-bg sm:max-h-[min(78dvh,620px)] sm:max-w-lg"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
            >
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-brand-border pb-4">
              <h2 id="size-guide-title" className="font-playfair text-2xl text-brand-text">
                Size guide
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-brand-border px-2.5 py-1 font-jost text-sm text-brand-muted transition hover:border-brand-pink/40"
              >
                Close
              </button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border border-brand-border">
              <table className="w-full min-w-[360px] border-collapse font-jost text-xs">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-surface text-left text-[10px] uppercase tracking-wider text-brand-muted">
                    <th className="px-2 py-2 font-medium">Label</th>
                    <th className="px-2 py-2 font-medium">UK</th>
                    <th className="px-2 py-2 font-medium">Bust (cm)</th>
                    <th className="px-2 py-2 font-medium">Waist (cm)</th>
                    <th className="px-2 py-2 font-medium">Hips (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE_ROWS.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-brand-border last:border-0 ${
                        i % 2 === 1 ? "bg-brand-surface" : "bg-brand-bg"
                      }`}
                    >
                      <td className="px-2 py-2.5 font-medium text-brand-text">{row.label}</td>
                      <td className="px-2 py-2.5 text-brand-muted">{row.uk}</td>
                      <td className="px-2 py-2.5 text-brand-text">{row.bust}</td>
                      <td className="px-2 py-2.5 text-brand-text">{row.waist}</td>
                      <td className="px-2 py-2.5 text-brand-text">{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 font-jost text-[11px] leading-relaxed text-brand-muted">
              Between sizes? We usually recommend sizing up for a more relaxed fit. Still unsure? Email{" "}
              <a href={`mailto:${SITE_EMAIL}`} className="text-brand-pink hover:underline">
                {SITE_EMAIL}
              </a>
              .
            </p>

            <div className="mt-8 border-t border-brand-border pt-6">
              <p className="font-jost text-sm leading-relaxed text-brand-text">
                Still don&apos;t know which size you are? Fill in these details and we&apos;ll recommend a fit
                that works for this piece.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="font-jost text-[10px] uppercase tracking-wider text-brand-muted">
                    Height (cm)
                  </span>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={field} />
                </label>
                <label className="block">
                  <span className="font-jost text-[10px] uppercase tracking-wider text-brand-muted">
                    Fit
                  </span>
                  <select
                    value={fit}
                    onChange={(e) => setFit(e.target.value as FitPreference)}
                    className={field}
                  >
                    <option value="fitted">Fitted</option>
                    <option value="regular">Regular</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </label>
                <label className="block">
                  <span className="font-jost text-[10px] uppercase tracking-wider text-brand-muted">
                    Usual size
                  </span>
                  <select value={usual} onChange={(e) => setUsual(e.target.value)} className={field}>
                    {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={run}
                className="mt-4 w-full rounded-lg border border-brand-pink bg-[var(--surface-card-soft)] py-3 font-jost text-sm font-semibold text-brand-text transition hover:bg-brand-pink-muted"
              >
                Get recommendation
              </button>
              {result ? (
                <p className="mt-4 text-center font-jost text-sm text-brand-text">
                  We recommend <strong className="text-brand-pink">{result}</strong> for your measurements.
                </p>
              ) : null}
            </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
