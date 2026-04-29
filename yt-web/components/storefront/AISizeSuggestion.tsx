"use client";

import { useMemo, useState } from "react";
import type { FitPreference, SizeInputs } from "@/lib/sizeRecommendation";
import { recommendSize } from "@/lib/sizeRecommendation";

interface AISizeSuggestionProps {
  /** When true, copy targets the person being shopped for */
  giftMode?: boolean;
}

export function AISizeSuggestion({ giftMode }: AISizeSuggestionProps) {
  const [height, setHeight] = useState("165");
  const [fit, setFit] = useState<FitPreference>("regular");
  const [usual, setUsual] = useState("M");

  const inputs: SizeInputs = useMemo(
    () => ({
      heightCm: Math.max(120, Math.min(210, Number(height) || 165)),
      fit,
      usualSize: usual,
    }),
    [height, fit, usual],
  );

  const rec = recommendSize(inputs);

  return (
    <div className="rounded-lg border border-brand-border bg-brand-elevated p-5">
      <p className="font-bebas text-lg tracking-wide text-brand-pink">
        {giftMode ? "SIZE HELP FOR YOUR GIFT" : "AI SIZE SUGGESTION"}
      </p>
      <p className="mt-1 font-jost text-xs text-brand-muted">
        {giftMode
          ? "What describes the person you’re buying for?"
          : "Height, fit preference, and usual size — we suggest the best match."}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="font-jost text-xs text-brand-dimmed">Height (cm)</span>
          <input
            type="number"
            min={120}
            max={210}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-sm text-brand-text outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          />
        </label>
        <label className="block">
          <span className="font-jost text-xs text-brand-dimmed">Body fit preference</span>
          <select
            value={fit}
            onChange={(e) => setFit(e.target.value as FitPreference)}
            className="mt-1 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-sm text-brand-text outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            <option value="fitted">Fitted</option>
            <option value="regular">Regular</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </label>
        <label className="block">
          <span className="font-jost text-xs text-brand-dimmed">Usual size</span>
          <select
            value={usual}
            onChange={(e) => setUsual(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-sm text-brand-text outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-pink-muted px-4 py-2 font-jost text-sm font-medium text-brand-pink">
        Recommended: {rec}
      </p>
    </div>
  );
}
