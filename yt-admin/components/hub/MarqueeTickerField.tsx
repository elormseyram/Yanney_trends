"use client";

import { useState } from "react";

export function MarqueeTickerField({
  defaultText,
  defaultActive,
}: {
  defaultText: string;
  defaultActive: boolean;
}) {
  const [text, setText] = useState(defaultText);
  const [active, setActive] = useState(defaultActive);
  const trimmed = text.trim();
  const showLive = active && trimmed.length > 0;

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">Home marquee ticker</h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            When enabled, this text replaces the default scrolling strip on the landing page (you can still
            prepend the short announcement above it).
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
            showLive
              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"
              : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
          }`}
        >
          {showLive ? "Live" : "Off"}
        </span>
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="marquee_ticker_text" className="text-xs font-medium text-stone-600 dark:text-stone-400">
            Ticker text
          </label>
          <textarea
            id="marquee_ticker_text"
            name="marquee_ticker_text"
            rows={2}
            maxLength={400}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. SPRING DROP · NEW BAGS · SAME-DAY ACCRA ·"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
          />
        </div>
        <label className="flex flex-wrap items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
          <input
            type="checkbox"
            name="marquee_ticker_active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={trimmed.length === 0}
          />
          Use this text on the home page marquee
        </label>
      </div>
    </section>
  );
}
