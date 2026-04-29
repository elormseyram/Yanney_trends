"use client";

import { useState } from "react";

export function AnnouncementField({
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
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">Announcement banner</h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            One short line shoppers see at the top of the storefront. Use it for restocks, holidays,
            or promo windows.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
            showLive
              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"
              : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
          }`}
          aria-live="polite"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              showLive ? "animate-pulse bg-rose-500" : "bg-stone-400 dark:bg-stone-500"
            }`}
            aria-hidden
          />
          {showLive ? "Live" : "Off"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="announcement_text"
            className="text-xs font-medium text-stone-600 dark:text-stone-400"
          >
            Banner text
          </label>
          <textarea
            id="announcement_text"
            name="announcement_text"
            rows={2}
            maxLength={240}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. New drop · Free delivery in Accra this weekend"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
          />
          <p className="mt-1 text-[11px] text-stone-400">
            {trimmed.length}/240 characters · keep it short and punchy.
          </p>
        </div>

        <label className="flex flex-wrap items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
          <input
            type="checkbox"
            name="announcement_active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={trimmed.length === 0}
          />
          Show this announcement on the storefront
          {trimmed.length === 0 ? (
            <span className="text-xs text-stone-400">— add some text first</span>
          ) : null}
        </label>

        {showLive ? (
          <div
            className="rounded-lg border border-rose-200/70 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
            role="status"
          >
            <span className="font-semibold uppercase tracking-wider">Preview · </span>
            {trimmed}
          </div>
        ) : null}
      </div>
    </section>
  );
}
