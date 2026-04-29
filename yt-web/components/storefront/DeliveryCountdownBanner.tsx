"use client";

import { motion } from "framer-motion";
import { useDeliveryCountdown } from "@/lib/deliveryCountdown";

export function DeliveryCountdownBanner() {
  const left = useDeliveryCountdown();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border-b border-[#f3b8cc] bg-[#faf7f5]"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 py-3 sm:flex-row sm:gap-6 sm:py-3.5">
        <p className="font-bebas text-sm tracking-[0.2em] text-brand-text">ORDER WINDOW</p>
        <p className="font-jost text-sm text-brand-text">
          <span className="font-semibold tabular-nums text-brand-pink">{left}</span>
          <span className="ml-2 text-brand-muted">left before today&apos;s cut-off · Accra delivery + nationwide shipping</span>
        </p>
      </div>
    </motion.div>
  );
}
