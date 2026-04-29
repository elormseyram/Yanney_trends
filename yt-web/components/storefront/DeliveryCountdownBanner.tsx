"use client";

import { motion } from "framer-motion";
import { useDeliveryCountdown } from "@/lib/deliveryCountdown";
import { useShopSettings } from "@/components/storefront/ShopSettingsProvider";

export function DeliveryCountdownBanner() {
  const { announcementText, announcementActive, deliveryCutoffHour, deliveryCutoffMinute } =
    useShopSettings();
  const left = useDeliveryCountdown(deliveryCutoffHour, deliveryCutoffMinute);
  const showAdmin =
    announcementActive && typeof announcementText === "string" && announcementText.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border-b border-[#f3b8cc] bg-[#faf7f5]"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 py-3 sm:flex-row sm:gap-6 sm:py-3.5">
        {showAdmin ? (
          <p className="max-w-4xl text-center font-jost text-sm font-medium text-brand-text">
            <span className="font-bebas tracking-[0.2em] text-brand-pink">NOTICE · </span>
            {announcementText!.trim()}
          </p>
        ) : null}
        <p className="font-bebas text-sm tracking-[0.2em] text-brand-text">ORDER WINDOW</p>
        <p className="font-jost text-sm text-brand-text">
          <span className="font-semibold tabular-nums text-brand-pink">{left}</span>
          <span className="ml-2 text-brand-muted">left before today&apos;s cut-off · Accra delivery + nationwide shipping</span>
        </p>
      </div>
    </motion.div>
  );
}
