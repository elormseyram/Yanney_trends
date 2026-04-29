"use client";

import { useDeliveryCountdown } from "@/lib/deliveryCountdown";

type MarqueeVariant = "light" | "dark";

export function MarqueeTicker({ variant = "light" }: { variant?: MarqueeVariant }) {
  const countdown = useDeliveryCountdown();
  const text =
    "NEW ARRIVALS · DANSOMAN ACCRA · IN-STORE PICKUP · MOBILE MONEY ACCEPTED · DRESS BOLD MOVE DIFFERENT · ";
  const isDark = variant === "dark";
  return (
    <div
      className={`flex flex-col border-b sm:flex-row sm:items-stretch ${
        isDark
          ? "border-brand-border bg-brand-elevated"
          : "border-brand-border bg-brand-surface"
      }`}
    >
      <div className="min-w-0 flex-1 overflow-hidden py-2.5">
        <div
          className={`flex w-max animate-marquee font-bebas text-sm tracking-widest ${
            isDark ? "text-brand-pink" : "text-brand-pink"
          }`}
        >
          <span className="pr-8">{text}</span>
          <span className="pr-8">{text}</span>
        </div>
      </div>
      <div
        className={`flex shrink-0 items-center justify-center border-t px-4 py-2 sm:border-l sm:border-t-0 ${
          isDark ? "border-brand-border bg-brand-bg/70" : "border-brand-border bg-brand-elevated/80"
        }`}
      >
        <p
          className={`whitespace-nowrap font-jost text-[10px] sm:text-xs ${
            isDark ? "text-brand-muted" : "text-brand-muted"
          }`}
        >
          <span className="font-bebas tracking-wider text-brand-pink">NEXT BATCH </span>
          <span
            className={`ml-1.5 tabular-nums font-semibold ${isDark ? "text-brand-text" : "text-brand-text"}`}
          >
            {countdown}
          </span>
        </p>
      </div>
    </div>
  );
}
