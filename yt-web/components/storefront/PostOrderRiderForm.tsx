"use client";

import { useState } from "react";
import { SELF_ARRANGED_SERVICES, SHOP_ADDRESS, type SelfArrangedServiceId } from "@/lib/constants";
import { choice } from "@/lib/choiceStyles";

/**
 * Shown after placing an order when the customer chose self-arranged rider.
 * They share app + rider details here (post-checkout), not during cart steps.
 */
export function PostOrderRiderForm({ orderRef }: { orderRef: string }) {
  const [service, setService] = useState<SelfArrangedServiceId | "">("");
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [appOrderRef, setAppOrderRef] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="print:hidden mt-10 rounded-xl border border-[#f9c9d9] bg-[#fff8fa] p-6 text-left">
      <p className="font-bebas text-sm tracking-[0.2em] text-brand-pink">YOUR RIDER (AFTER ORDER)</p>
      <p className="mt-2 font-jost text-sm text-brand-muted">
        Book on SheRides, Yango, Bolt, or Uber Connect. Send us the rider details so we can hand off
        smoothly at the boutique.
      </p>
      <p className="mt-3 rounded-lg border border-[#f3b8cc] bg-white px-3 py-2 font-jost text-xs text-brand-text">
        <span className="text-brand-dimmed">Pickup from:</span> {SHOP_ADDRESS}
      </p>

      {saved ? (
        <p className="mt-4 font-jost text-sm text-brand-pink">
          Thanks — we&apos;ll watch for this rider for order {orderRef}. (Demo: not sent to server yet.)
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block">
            <span className="font-jost text-xs text-brand-dimmed">App / service *</span>
            <select
              required
              value={service}
              onChange={(e) => setService(e.target.value as SelfArrangedServiceId)}
              className="mt-1 w-full rounded-lg border border-[#f3b8cc] bg-white px-3 py-2.5 font-jost text-sm outline-none focus:border-brand-pink/45 focus:ring-2 focus:ring-brand-pink/12"
            >
              <option value="">Choose one</option>
              {SELF_ARRANGED_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-jost text-xs text-brand-dimmed">Rider name *</span>
            <input
              required
              value={riderName}
              onChange={(e) => setRiderName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#f3b8cc] bg-white px-3 py-2.5 font-jost text-sm outline-none focus:border-brand-pink/45 focus:ring-2 focus:ring-brand-pink/12"
            />
          </label>
          <label className="block">
            <span className="font-jost text-xs text-brand-dimmed">Rider phone *</span>
            <input
              required
              value={riderPhone}
              onChange={(e) => setRiderPhone(e.target.value)}
              placeholder="+233…"
              className="mt-1 w-full rounded-lg border border-[#f3b8cc] bg-white px-3 py-2.5 font-jost text-sm outline-none focus:border-brand-pink/45 focus:ring-2 focus:ring-brand-pink/12"
            />
          </label>
          <label className="block">
            <span className="font-jost text-xs text-brand-dimmed">Trip / order ID in app (optional)</span>
            <input
              value={appOrderRef}
              onChange={(e) => setAppOrderRef(e.target.value)}
              placeholder="e.g. Yango #, Bolt code"
              className="mt-1 w-full rounded-lg border border-[#f3b8cc] bg-white px-3 py-2.5 font-jost text-sm outline-none focus:border-brand-pink/45 focus:ring-2 focus:ring-brand-pink/12"
            />
          </label>
          <label className="block">
            <span className="font-jost text-xs text-brand-dimmed">Notes for the team</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Bike colour, ETA…"
              className="mt-1 w-full rounded-lg border border-[#f3b8cc] bg-white px-3 py-2 font-jost text-sm outline-none focus:border-brand-pink/45 focus:ring-2 focus:ring-brand-pink/12"
            />
          </label>
          <button
            type="submit"
            className={`w-full ${choice.cta} py-3 font-semibold`}
          >
            Send rider details (demo)
          </button>
        </form>
      )}
    </div>
  );
}
