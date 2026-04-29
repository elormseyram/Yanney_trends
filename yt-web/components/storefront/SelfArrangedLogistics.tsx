"use client";

import { useState } from "react";
import {
  SHOP_ADDRESS,
  SELF_ARRANGED_SERVICES,
  type SelfArrangedServiceId,
} from "@/lib/constants";

export function SelfArrangedLogistics() {
  const [selected, setSelected] = useState<SelfArrangedServiceId | null>(null);
  const svc = SELF_ARRANGED_SERVICES.find((s) => s.id === selected);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(SHOP_ADDRESS);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <p className="font-jost text-sm text-brand-muted">
        Choose your delivery app. We do not add a boutique delivery fee for this option — you pay
        the rider directly in the app.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SELF_ARRANGED_SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              selected === s.id
                ? "border-brand-pink bg-brand-pink-muted"
                : "border-brand-border bg-brand-surface hover:border-brand-pink/40"
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-surface font-bebas text-xl text-brand-pink">
              {s.logoLetter}
            </span>
            <span className="text-center font-jost text-xs leading-tight text-brand-text">
              {s.name}
            </span>
          </button>
        ))}
      </div>

      {svc ? (
        <div className="space-y-4 rounded-lg border border-brand-border bg-brand-surface p-5">
          <div>
            <p className="font-bebas text-sm tracking-wide text-brand-pink">PICKUP ADDRESS</p>
            <p className="mt-1 font-jost text-sm text-brand-text">{SHOP_ADDRESS}</p>
            <button
              type="button"
              onClick={copyAddress}
              className="mt-3 rounded-lg border border-brand-pink px-4 py-2 font-jost text-xs font-semibold text-brand-pink hover:bg-brand-pink-muted"
            >
              Copy address
            </button>
          </div>
          <div className="border-t border-brand-border pt-4">
            <p className="font-jost text-sm leading-relaxed text-brand-muted">
              Place an order on <span className="text-brand-text">{svc.name}</span>, use our shop
              address as the pickup point, and your address as the drop-off.
            </p>
            <p className="mt-3 font-jost text-xs text-brand-dimmed">
              Let us know your rider&apos;s name when they arrive.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
