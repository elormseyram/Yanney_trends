"use client";

import { useMemo, useState } from "react";
import { detectZone, getDeliveryFee, getEstimatedDelivery } from "@/lib/delivery";

export function DeliveryEstimator() {
  const [address, setAddress] = useState("");

  const zone = useMemo(() => (address.trim() ? detectZone(address) : null), [address]);

  return (
    <div className="rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card-soft)] p-4 shadow-sm">
      <p className="font-bebas text-sm tracking-wide text-brand-pink">DELIVERY ESTIMATE</p>
      <p className="mt-1 font-jost text-xs text-brand-muted">
        Enter area or landmark — we detect zone and typical timeline.
      </p>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="e.g. Dansoman, East Legon, Tema…"
        className="mt-3 w-full rounded-lg border border-[var(--border-pink)] bg-[var(--surface-input)] px-3 py-2.5 font-jost text-sm text-brand-text outline-none transition-colors placeholder:text-brand-dimmed/60 focus:border-brand-pink/60 focus:ring-2 focus:ring-brand-pink/15"
      />
      {zone ? (
        <div className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-3 py-2 font-jost text-xs text-brand-text dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p>
            Zone <strong>{zone}</strong> · Fee from boutique:{" "}
            <strong>GHS {getDeliveryFee(zone)}</strong>
          </p>
          <p className="mt-1 text-brand-muted">{getEstimatedDelivery(zone)}</p>
        </div>
      ) : null}
    </div>
  );
}
