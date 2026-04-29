"use client";

import { useShopSettings } from "@/components/storefront/ShopSettingsProvider";

export function StoreClosedBanner() {
  const { shopIsOpen, deliveryAvailable } = useShopSettings();
  if (shopIsOpen) return null;
  return (
    <div className="border-b border-amber-300/80 bg-amber-50 px-4 py-2 text-center dark:border-amber-600/40 dark:bg-amber-950/40">
      {deliveryAvailable ? (
        <p className="font-jost text-sm font-medium text-amber-950 dark:text-amber-100">
          The boutique is closed for pickup right now — you can still place a{" "}
          <span className="font-semibold">delivery</span> order at checkout if delivery stays open.
        </p>
      ) : (
        <p className="font-jost text-sm font-medium text-amber-950 dark:text-amber-100">
          We&apos;re closed for new orders right now — browse the collection and check back soon.
        </p>
      )}
    </div>
  );
}
