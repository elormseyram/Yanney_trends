"use client";

import { useDeliveryCountdown } from "@/lib/deliveryCountdown";
import { useShopSettings } from "@/components/storefront/ShopSettingsProvider";

type MarqueeVariant = "light" | "dark";

const FALLBACK_STRIP =
  "NEW ARRIVALS · DANSOMAN ACCRA · IN-STORE PICKUP · MOBILE MONEY ACCEPTED · DRESS BOLD MOVE DIFFERENT · ";

export function MarqueeTicker({ variant = "light" }: { variant?: MarqueeVariant }) {
  const {
    announcementText,
    announcementActive,
    marqueeTickerText,
    marqueeTickerActive,
    deliveryCutoffHour,
    deliveryCutoffMinute,
  } = useShopSettings();
  const countdown = useDeliveryCountdown(deliveryCutoffHour, deliveryCutoffMinute);

  const adminLine =
    announcementActive && announcementText?.trim()
      ? `${announcementText.trim().replace(/\s+/g, " ")} · `
      : "";
  const strip =
    marqueeTickerActive && marqueeTickerText?.trim()
      ? `${marqueeTickerText.trim().replace(/\s+/g, " ")} · `
      : FALLBACK_STRIP;
  const text = `${adminLine}${strip}`;

  const isDark = variant === "dark";

  return (
    <div
      className={`flex flex-col border-b sm:flex-row sm:items-stretch ${
        isDark
          ? "border-white/10 bg-[#0a0a0a] dark:border-brand-border dark:bg-brand-elevated"
          : "border-brand-border bg-brand-surface dark:bg-brand-elevated"
      }`}
    >
      {/* Scrolling text */}
      <div className="min-w-0 flex-1 overflow-hidden py-2.5">
        <div className="flex w-max animate-marquee whitespace-nowrap font-bebas text-sm tracking-widest text-brand-pink">
          {/* Render 4 copies so the loop is seamless even on wide screens */}
          <span className="pr-12">{text}</span>
          <span className="pr-12">{text}</span>
          <span className="pr-12">{text}</span>
          <span className="pr-12">{text}</span>
        </div>
      </div>

      {/* Countdown badge */}
      <div
        className={`flex shrink-0 items-center justify-center border-t px-4 py-2 sm:border-l sm:border-t-0 ${
          isDark
            ? "border-white/10 bg-white/5 dark:border-brand-border dark:bg-brand-bg/70"
            : "border-brand-border bg-brand-elevated/80 dark:bg-brand-bg/70"
        }`}
      >
        <p
          className={`whitespace-nowrap font-jost text-[10px] sm:text-xs ${
            isDark ? "text-white/60 dark:text-brand-muted" : "text-brand-muted"
          }`}
        >
          <span className="font-bebas tracking-wider text-brand-pink">NEXT BATCH </span>
          <span
            className={`ml-1.5 tabular-nums font-semibold ${
              isDark ? "text-white dark:text-brand-text" : "text-brand-text"
            }`}
          >
            {countdown}
          </span>
        </p>
      </div>
    </div>
  );
}
