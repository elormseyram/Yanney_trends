"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { TermsBeforePaymentModal } from "@/components/storefront/TermsBeforePaymentModal";
import { GiftCheckoutPanel, type GiftFormState } from "@/components/storefront/GiftCheckoutPanel";
import { EmptyCartCheckoutAnimation } from "@/components/storefront/EmptyCartCheckoutAnimation";
import { DELIVERY_ZONES } from "@/lib/deliveryZones";
import { getPickupDateOptions, getPickupTimeSlots } from "@/lib/deliverySlots";

function genRef(): string {
  return `YT${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

const EMPTY_GIFT: GiftFormState = {
  isGiftOrder: false,
  recipientName: "",
  recipientPhone: "",
  recipientCity: "",
  recipientAddress: "",
  deliveryNotes: "",
  relationship: "Friend",
  giftMessage: "",
  hidePrice: false,
  sizeAssistMode: null,
  bodyDescription: "",
  stylistSize: null,
};

const field =
  "mt-1 w-full rounded-lg border border-brand-border bg-brand-elevated px-3 py-2.5 font-jost text-sm text-brand-text outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/15";

const pickupDates = getPickupDateOptions(21);

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  // Contact
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Fulfillment
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [zone, setZone] = useState(DELIVERY_ZONES[0].id);
  const [address, setAddress] = useState("");

  // Pickup appointment
  const [pickupDate, setPickupDate] = useState("");
  const [pickupSlot, setPickupSlot] = useState("");
  const pickupSlots = getPickupTimeSlots(pickupDate);

  // Gift
  const [gift, setGift] = useState<GiftFormState>(EMPTY_GIFT);

  // UI state
  const [termsOpen, setTermsOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedZone = DELIVERY_ZONES.find((z) => z.id === zone) ?? DELIVERY_ZONES[0];
  const deliveryFee = fulfillment === "DELIVERY" ? selectedZone.riderFeeGhs : 0;
  const subtotal = items.reduce((t, i) => t + i.unitPrice * i.quantity, 0);
  const total = subtotal + deliveryFee;

  const pickupReady = fulfillment === "PICKUP" ? Boolean(pickupDate && pickupSlot) : true;
  const deliveryReady = fulfillment === "DELIVERY" ? address.trim().length > 3 : true;

  const canProceed =
    name.trim().length > 1 &&
    phone.trim().length >= 9 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    pickupReady &&
    deliveryReady &&
    items.length > 0;

  async function handleAccepted() {
    setTermsOpen(false);
    setPaying(true);
    setError(null);

    try {
      // Save profile — session was just established by the modal's OTP exchange
      await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const orderNumber = genRef();
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: orderNumber,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim(),
          fulfillment_type: fulfillment,
          delivery_address: fulfillment === "DELIVERY" ? address.trim() : null,
          delivery_zone: fulfillment === "DELIVERY" ? zone : null,
          scheduled_date: fulfillment === "PICKUP" ? pickupDate : null,
          scheduled_slot: fulfillment === "PICKUP" ? pickupSlot : null,
          items: items.map((i) => ({
            product_id: i.productId,
            name: i.name,
            size: i.size,
            color: i.color ?? null,
            quantity: i.quantity,
            unit_price: i.unitPrice,
          })),
          subtotal,
          delivery_fee: deliveryFee,
          total,
          currency: "GHS",
          is_gift_order: gift.isGiftOrder,
          gift_message: gift.giftMessage || null,
          relationship: gift.relationship || null,
          recipient_name: gift.isGiftOrder ? gift.recipientName : null,
          recipient_phone: gift.isGiftOrder ? gift.recipientPhone : null,
          recipient_city: gift.isGiftOrder ? gift.recipientCity : null,
          recipient_address: gift.isGiftOrder ? gift.recipientAddress : null,
          gift_delivery_notes: gift.isGiftOrder ? gift.deliveryNotes : null,
        }),
      });

      const data = await res.json();
      if (!data.ok || !data.authorization_url) {
        throw new Error(data.message ?? "Could not start payment. Please try again.");
      }

      clearCart();
      window.location.href = data.authorization_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setPaying(false);
    }
  }

  if (items.length === 0 && !paying) {
    return <EmptyCartCheckoutAnimation />;
  }

  return (
    <div className="min-h-screen bg-brand-surface px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-playfair text-2xl text-brand-text">Checkout</h1>
        <p className="mt-1 font-jost text-sm text-brand-muted">
          Fill in your details. We&apos;ll send a one-time code to your phone to confirm your order.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-jost text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Contact details */}
            <section className="rounded-xl border border-brand-border bg-brand-bg p-5">
              <h2 className="font-jost text-[10px] font-semibold uppercase tracking-widest text-brand-pink">
                Your details
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="font-jost text-xs text-brand-dimmed">Full name *</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ama Boateng"
                    className={field}
                  />
                </label>
                <label className="block">
                  <span className="font-jost text-xs text-brand-dimmed">Phone * (receives OTP)</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 XX XXX XXXX"
                    className={field}
                  />
                </label>
                <label className="block">
                  <span className="font-jost text-xs text-brand-dimmed">Email *</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className={field}
                  />
                </label>
              </div>
            </section>

            {/* Fulfillment */}
            <section className="rounded-xl border border-brand-border bg-brand-bg p-5">
              <h2 className="font-jost text-[10px] font-semibold uppercase tracking-widest text-brand-pink">
                Delivery or pickup
              </h2>
              <div className="mt-4 flex gap-3">
                {(["DELIVERY", "PICKUP"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFulfillment(type);
                      setPickupDate("");
                      setPickupSlot("");
                    }}
                    className={`flex-1 rounded-lg border py-3 font-jost text-sm transition ${
                      fulfillment === type
                        ? "border-brand-pink bg-brand-pink text-white"
                        : "border-brand-border text-brand-muted hover:border-brand-pink"
                    }`}
                  >
                    {type === "DELIVERY" ? "Delivery" : "Boutique Pickup"}
                  </button>
                ))}
              </div>

              {fulfillment === "DELIVERY" && (
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="font-jost text-xs text-brand-dimmed">Delivery zone *</span>
                    <select value={zone} onChange={(e) => setZone(e.target.value)} className={field}>
                      {DELIVERY_ZONES.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.label} — GHS {z.riderFeeGhs} ({z.eta})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-jost text-xs text-brand-dimmed">Delivery address *</span>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House number, street, neighbourhood..."
                      className={field}
                    />
                  </label>
                </div>
              )}

              {fulfillment === "PICKUP" && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border border-brand-border bg-brand-surface px-4 py-3">
                    <p className="font-jost text-xs font-semibold text-brand-text">
                      Yanney Trendss Boutique — Dansoman, Accra
                    </p>
                    <p className="mt-1 font-jost text-xs text-brand-muted">
                      Mon – Fri: 10:00am – 8:00pm &nbsp;·&nbsp; Sat: 10:00am – 6:00pm &nbsp;·&nbsp; Sun: Closed
                    </p>
                    <p className="mt-1 font-jost text-xs text-brand-muted">
                      Bring your order reference and a valid ID.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="font-jost text-xs text-brand-dimmed">Pickup date *</span>
                      <select
                        value={pickupDate}
                        onChange={(e) => {
                          setPickupDate(e.target.value);
                          setPickupSlot(""); // reset slot when date changes
                        }}
                        className={field}
                      >
                        <option value="">Choose a date</option>
                        {pickupDates.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="font-jost text-xs text-brand-dimmed">Arrival window *</span>
                      <select
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value)}
                        disabled={!pickupDate}
                        className={field}
                      >
                        <option value="">
                          {pickupDate ? "Choose a time" : "Select date first"}
                        </option>
                        {pickupSlots.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </section>

            {/* Gift */}
            <GiftCheckoutPanel
              buyerName={name}
              buyerPhone={phone}
              buyerEmail={email}
              value={gift}
              onChange={setGift}
            />
          </div>

          {/* Right column: order summary */}
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-border bg-brand-bg p-5">
              <h2 className="font-jost text-[10px] font-semibold uppercase tracking-widest text-brand-pink">
                Order summary
              </h2>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.size}-${item.color ?? ""}`}
                    className="flex gap-3"
                  >
                    <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-brand-border bg-brand-elevated">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-jost text-sm text-brand-text">{item.name}</p>
                      <p className="font-jost text-xs text-brand-muted">
                        {item.size}
                        {item.color ? ` · ${item.color}` : ""} × {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-jost text-sm text-brand-text">
                      GHS {(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-1.5 border-t border-brand-border pt-4 font-jost text-sm">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal</span>
                  <span>GHS {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Delivery</span>
                  <span>{fulfillment === "PICKUP" ? "Free" : `GHS ${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between border-t border-brand-border pt-2 font-semibold text-brand-text">
                  <span>Total</span>
                  <span>GHS {total.toFixed(2)}</span>
                </div>
              </div>

              {fulfillment === "PICKUP" && pickupDate && pickupSlot && (
                <div className="mt-3 rounded-lg bg-brand-surface px-3 py-2">
                  <p className="font-jost text-xs text-brand-muted">
                    Pickup appointment
                  </p>
                  <p className="font-jost text-xs font-semibold text-brand-text">
                    {pickupDates.find((d) => d.value === pickupDate)?.label} · {pickupSlot}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!canProceed || paying}
              onClick={() => setTermsOpen(true)}
              className="w-full rounded-xl bg-brand-pink py-3.5 font-jost text-sm font-semibold text-white transition hover:bg-brand-pink-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {paying ? "Processing..." : "Review terms & pay"}
            </button>

            {!canProceed && items.length > 0 && (
              <p className="text-center font-jost text-[11px] text-brand-muted">
                Fill in all required fields above to continue.
              </p>
            )}

            <p className="text-center font-jost text-[11px] text-brand-muted">
              You&apos;ll pay with Mobile Money on the next screen.
            </p>

            <Link
              href="/shop"
              className="block text-center font-jost text-xs text-brand-muted hover:text-brand-pink"
            >
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>

      <TermsBeforePaymentModal
        open={termsOpen}
        phone={phone}
        email={email}
        name={name}
        onClose={() => setTermsOpen(false)}
        onAccept={handleAccepted}
      />
    </div>
  );
}
