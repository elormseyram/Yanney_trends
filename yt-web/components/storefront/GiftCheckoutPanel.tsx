"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BODY_DESCRIPTIONS, RELATIONSHIPS, type BodyDescription } from "@/lib/constants";
import { giftBodyTypeRecommendation } from "@/lib/sizeRecommendation";
import { AISizeSuggestion } from "@/components/storefront/AISizeSuggestion";
import { recipientPanel } from "@/lib/motion";
import { useUiStore } from "@/store/uiStore";

export interface GiftFormState {
  isGiftOrder: boolean;
  recipientName: string;
  recipientPhone: string;
  recipientCity: string;
  recipientAddress: string;
  deliveryNotes: string;
  relationship: string;
  giftMessage: string;
  hidePrice: boolean;
  sizeAssistMode: "known" | "body" | "stylist" | null;
  bodyDescription: BodyDescription | "";
  stylistSize: string | null;
}

function MiniConfetti() {
  const pieces = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg" aria-hidden>
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-sm bg-brand-pink"
          initial={{
            opacity: 0,
            x: "50%",
            y: "100%",
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            x: `${20 + (i % 7) * 12}%`,
            y: [100, 20 + (i % 3) * 15],
            scale: [0, 1, 0.6],
            rotate: i % 2 ? 45 : -30,
          }}
          transition={{ duration: 1.1, delay: i * 0.04, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

interface GiftCheckoutPanelProps {
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  value: GiftFormState;
  onChange: (next: GiftFormState) => void;
}

export function GiftCheckoutPanel({
  buyerName,
  buyerPhone,
  buyerEmail,
  value,
  onChange,
}: GiftCheckoutPanelProps) {
  const setGiftCheckoutActive = useUiStore((s) => s.setGiftCheckoutActive);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setGiftCheckoutActive(value.isGiftOrder);
    return () => setGiftCheckoutActive(false);
  }, [value.isGiftOrder, setGiftCheckoutActive]);

  const patch = (partial: Partial<GiftFormState>) => onChange({ ...value, ...partial });

  const sameAsBuyer = () => {
    patch({
      recipientName: buyerName,
      recipientPhone: buyerPhone,
    });
  };

  const applyStylist = () => {
    if (!value.bodyDescription) return;
    patch({
      stylistSize: giftBodyTypeRecommendation(value.bodyDescription),
      sizeAssistMode: "stylist",
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border p-5 transition-shadow duration-300 ${
        value.isGiftOrder
          ? "border-brand-pink/50 shadow-[0_0_0_1px_rgba(255,46,136,0.25)]"
          : "border-brand-border"
      }`}
    >
      {showConfetti ? <MiniConfetti /> : null}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.isGiftOrder}
          onChange={(e) => {
            const on = e.target.checked;
            if (on) {
              setShowConfetti(true);
              window.setTimeout(() => setShowConfetti(false), 1200);
            }
            patch({ isGiftOrder: on });
          }}
          className="mt-1 h-4 w-4 rounded border-brand-border text-brand-pink focus:ring-brand-pink"
        />
        <span className="font-jost text-sm text-brand-text">
          This order is for someone else <span aria-hidden>🎁</span>
        </span>
      </label>

      <AnimatePresence initial={false}>
        {value.isGiftOrder ? (
          <motion.div
            key="recipient"
            initial={recipientPanel.initial}
            animate={recipientPanel.animate}
            exit={recipientPanel.exit}
            transition={recipientPanel.transition}
            className="overflow-hidden"
          >
            <div className="space-y-5 pt-6">
              <button
                type="button"
                onClick={sameAsBuyer}
                className="rounded-lg border border-brand-border bg-brand-bg px-3 py-1.5 font-jost text-xs text-brand-muted hover:border-brand-pink hover:text-brand-pink"
              >
                Same as my details (name &amp; phone)
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="font-jost text-xs text-brand-dimmed">Recipient name *</span>
                  <input
                    required={value.isGiftOrder}
                    value={value.recipientName}
                    onChange={(e) => patch({ recipientName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  />
                </label>
                <label className="block">
                  <span className="font-jost text-xs text-brand-dimmed">Recipient phone *</span>
                  <input
                    required={value.isGiftOrder}
                    value={value.recipientPhone}
                    onChange={(e) => patch({ recipientPhone: e.target.value })}
                    className="mt-1 h-10 w-full box-border rounded-lg border border-brand-border bg-brand-bg px-3 font-jost text-sm leading-10 outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  />
                </label>
                <label className="block">
                  <span className="font-jost text-xs text-brand-dimmed">Relationship</span>
                  <select
                    value={value.relationship}
                    onChange={(e) => patch({ relationship: e.target.value })}
                    className="mt-1 h-10 w-full box-border rounded-lg border border-brand-border bg-brand-bg px-3 font-jost text-sm leading-10 outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="font-jost text-xs text-brand-dimmed">City</span>
                  <input
                    value={value.recipientCity}
                    onChange={(e) => patch({ recipientCity: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="font-jost text-xs text-brand-dimmed">Delivery address *</span>
                  <textarea
                    required={value.isGiftOrder}
                    rows={2}
                    value={value.recipientAddress}
                    onChange={(e) => patch({ recipientAddress: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="font-jost text-xs text-brand-dimmed">Delivery notes</span>
                  <textarea
                    rows={2}
                    value={value.deliveryNotes}
                    onChange={(e) => patch({ deliveryNotes: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  />
                </label>
              </div>

              <div className="rounded-lg border border-brand-border bg-brand-surface p-4">
                <p className="font-jost text-sm text-brand-text">
                  Not sure about size? We can help you choose.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      ["known", "Choose known size"],
                      ["body", "Describe body type"],
                      ["stylist", "Let Yanney Stylist Recommend"],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => patch({ sizeAssistMode: k })}
                      className={`rounded-lg px-3 py-1.5 font-jost text-xs ${
                        value.sizeAssistMode === k
                          ? "bg-brand-pink text-black"
                          : "border border-brand-border bg-brand-bg text-brand-muted hover:border-brand-pink"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {value.sizeAssistMode === "body" || value.sizeAssistMode === "stylist" ? (
                  <div className="mt-4 space-y-2">
                    <p className="font-jost text-xs text-brand-dimmed">Body description</p>
                    <div className="flex flex-wrap gap-2">
                      {BODY_DESCRIPTIONS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => patch({ bodyDescription: b })}
                          className={`rounded-lg px-2.5 py-1 font-jost text-xs ${
                            value.bodyDescription === b
                              ? "bg-brand-pink-muted text-brand-pink"
                              : "border border-brand-border text-brand-muted"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    {value.sizeAssistMode === "stylist" ? (
                      <button
                        type="button"
                        onClick={applyStylist}
                        className="mt-2 rounded-lg bg-brand-surface px-3 py-1.5 font-jost text-xs text-brand-text ring-1 ring-brand-border hover:ring-brand-pink"
                      >
                        Get Yanney recommendation
                      </button>
                    ) : null}
                    {value.stylistSize ? (
                      <p className="mt-2 font-jost text-sm text-brand-pink">
                        Yanney Recommended Size ✓ {value.stylistSize}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <AISizeSuggestion giftMode />

              <label className="block">
                <span className="font-jost text-xs text-brand-dimmed">Add a message 💌</span>
                <textarea
                  rows={3}
                  value={value.giftMessage}
                  onChange={(e) => patch({ giftMessage: e.target.value })}
                  placeholder="Optional note for the recipient..."
                  className="mt-1 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                />
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={value.hidePrice}
                  onChange={(e) => patch({ hidePrice: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-brand-border text-brand-pink focus:ring-brand-pink"
                />
                <span className="font-jost text-sm text-brand-text">
                  Keep price hidden from recipient <span aria-hidden>🎁</span>
                  <span className="mt-1 block text-xs text-brand-dimmed">
                    No invoice in package; tracking hides totals; delivery SMS has no amount.
                  </span>
                </span>
              </label>

              <p className="font-jost text-xs text-brand-dimmed">
                Buyer ({buyerEmail || buyerPhone}) receives payment confirmation and receipt.
                Recipient gets delivery updates only — never payment alerts.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
