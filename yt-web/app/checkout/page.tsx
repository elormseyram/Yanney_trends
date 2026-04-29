"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GiftCheckoutPanel,
  type GiftFormState,
} from "@/components/storefront/GiftCheckoutPanel";
import { ScheduledDeliveryFields } from "@/components/storefront/ScheduledDeliveryFields";
import { EmptyCartCheckoutAnimation } from "@/components/storefront/EmptyCartCheckoutAnimation";
import { TermsBeforePaymentModal } from "@/components/storefront/TermsBeforePaymentModal";
import { useCartStore } from "@/store/cartStore";
import { usePurchaseHistoryStore } from "@/store/purchaseHistoryStore";
import { getDeliveryDateOptions } from "@/lib/deliverySlots";
import { choice } from "@/lib/choiceStyles";
import { DELIVERY_ZONES, getDeliveryZone } from "@/lib/deliveryZones";

type Step = 1 | 2 | 3 | 4;
type Fulfillment = "PICKUP" | "DELIVERY";
type MobileNetwork = "MTN" | "TELECEL" | "AIRTELTIGO";

const MOBILE_NETWORKS: { id: MobileNetwork; label: string; sub: string }[] = [
  { id: "MTN", label: "MTN MoMo", sub: "Mobile Money on MTN" },
  { id: "TELECEL", label: "Telecel Cash", sub: "Mobile Money on Telecel (Vodafone)" },
  { id: "AIRTELTIGO", label: "AirtelTigo Money", sub: "Mobile Money on AirtelTigo" },
];

const initialGift: GiftFormState = {
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

function genOrderRef(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const r = Math.floor(Math.random() * 9000) + 1000;
  return `YT-${y}${m}${day}-${r}`;
}

const stepTitles = ["Details", "Fulfillment", "Payment", "Confirm"];

const softCard =
  "space-y-6 rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card-soft)] p-6 text-[var(--ink-strong)]";
const softInput =
  "mt-1 w-full rounded-lg border border-[var(--border-pink)] bg-[var(--surface-input)] px-3 py-2.5 font-jost text-sm text-[var(--ink-strong)] outline-none transition focus:border-brand-pink/60 focus:ring-2 focus:ring-brand-pink/15 placeholder:text-[var(--ink-dimmed)]";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const addPurchaseHistory = usePurchaseHistoryStore((s) => s.addFromOrder);
  const [step, setStep] = useState<Step>(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gift, setGift] = useState<GiftFormState>(initialGift);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("PICKUP");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDay, setDeliveryDay] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");
  const [deliveryZoneId, setDeliveryZoneId] = useState<string>("");

  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [mobileNetwork, setMobileNetwork] = useState<MobileNetwork | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((t, i) => t + i.unitPrice * i.quantity, 0),
    [items],
  );

  const selectedZone = deliveryZoneId ? getDeliveryZone(deliveryZoneId) : undefined;
  const deliveryFee =
    fulfillment === "DELIVERY"
      ? selectedZone?.riderFeeGhs ?? 0
      : 0;
  const total = subtotal + deliveryFee;

  const deliveryDayLabel = useMemo(
    () => getDeliveryDateOptions(24).find((d) => d.value === deliveryDay)?.label ?? "",
    [deliveryDay],
  );

  const validateStep1 = () => {
    if (!name.trim() || !phone.trim()) return false;
    if (gift.isGiftOrder) {
      if (!gift.recipientName.trim() || !gift.recipientPhone.trim()) return false;
      if (!gift.recipientAddress.trim()) return false;
    }
    return true;
  };

  const validateStep2 = () =>
    Boolean(
      fulfillment === "PICKUP"
        ? deliveryDay && deliveryTimeSlot
        : deliveryZoneId && deliveryAddress.trim() && deliveryDay && deliveryTimeSlot,
    );

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 2 && !paymentTermsAccepted) {
      setTermsModalOpen(true);
      return;
    }
    if (step === 3 && !mobileNetwork) return;
    setStep((s) => Math.min(4, s + 1) as Step);
  };

  const handleTermsAccept = (acceptanceEmail: string) => {
    setPaymentTermsAccepted(true);
    if (!email.trim() && acceptanceEmail) setEmail(acceptanceEmail);
    setTermsModalOpen(false);
    setStep(3);
  };

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[var(--surface-page)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] grain-overlay" />
        <EmptyCartCheckoutAnimation />
      </div>
    );
  }

  const networkLabel =
    MOBILE_NETWORKS.find((n) => n.id === mobileNetwork)?.label ?? "Mobile Money";

  const placeOrderAndPay = async () => {
    setPayErr(null);
    setIsSubmitting(true);
    const ref = genOrderRef();
    const orderItems = items.map((i) => ({
      product_id: i.productId,
      name: i.name,
      size: i.size,
      color: i.color ?? null,
      quantity: i.quantity,
      price: i.unitPrice,
      line_total: i.unitPrice * i.quantity,
      image_url: i.imageUrl ?? null,
      slug: i.slug ?? null,
    }));
    const scheduledDate = deliveryDay || null;
    const scheduledSlot = deliveryTimeSlot || null;
    const deliveryAddressValue = fulfillment === "DELIVERY" ? deliveryAddress.trim() : null;
    const res = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_number: ref,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || null,
        fulfillment_type: fulfillment,
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        currency: "GHS",
        delivery_address: deliveryAddressValue,
        delivery_zone: deliveryZoneId || null,
        scheduled_date: scheduledDate,
        scheduled_slot: scheduledSlot,
        is_gift_order: gift.isGiftOrder,
        gift_message: gift.giftMessage || null,
        relationship: gift.relationship || null,
        mobile_network: mobileNetwork,
      }),
    });
    const init = (await res.json()) as { ok: boolean; authorization_url?: string; message?: string };
    if (!init.ok || !init.authorization_url) {
      setPayErr(init.message || "Could not start payment. Please try again.");
      setIsSubmitting(false);
      return;
    }

    addPurchaseHistory(items.map((i) => i.productId));
    clearCart();
    window.location.assign(init.authorization_url);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface-page)] text-[var(--ink-strong)]">
      <TermsBeforePaymentModal
        open={termsModalOpen}
        initialEmail={email}
        onClose={() => setTermsModalOpen(false)}
        onAccept={handleTermsAccept}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] grain-overlay" />
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-bebas text-xs tracking-[0.35em] text-brand-pink">YOUR CART</p>
          <h1 className="mt-2 font-playfair text-3xl text-[var(--ink-strong)] md:text-4xl">Almost ready</h1>
          <p className="mt-2 max-w-md font-jost text-sm text-[var(--ink-muted)]">
            Quick details, pickup or delivery, then pay with Mobile Money.
          </p>
        </motion.div>

        <div className="mt-10">
          <div className="flex gap-1 rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card)] p-2">
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="relative flex-1">
                <motion.div
                  className="absolute inset-0 rounded-lg bg-brand-pink/20"
                  initial={false}
                  animate={{ opacity: step >= n ? 1 : 0, scale: step === n ? 1 : 0.92 }}
                  transition={{ duration: 0.35 }}
                />
                <div
                  className={`relative z-10 py-2.5 text-center font-jost text-[10px] font-medium uppercase tracking-wide sm:text-xs ${
                    step === n ? "text-[var(--ink-strong)]" : "text-[var(--ink-dimmed)]"
                  }`}
                >
                  {stepTitles[n - 1]}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--surface-pop)]">
            <motion.div
              className="h-full rounded-full bg-brand-pink"
              initial={false}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3 }}
            className="mt-10"
          >
            {step === 1 ? (
              <div className="space-y-8">
                <div className={`space-y-4 ${softCard}`}>
                  <h2 className="font-bebas text-xl tracking-wide text-brand-pink">Buyer (payer)</h2>
                  <label className="block">
                    <span className="font-jost text-xs text-brand-dimmed">Name *</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={softInput} />
                  </label>
                  <label className="block">
                    <span className="font-jost text-xs text-brand-dimmed">Phone * (+233…)</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className={softInput} />
                  </label>
                  <label className="block">
                    <span className="font-jost text-xs text-brand-dimmed">Email (optional)</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={softInput}
                    />
                  </label>
                </div>
                <GiftCheckoutPanel
                  buyerName={name}
                  buyerPhone={phone}
                  buyerEmail={email}
                  value={gift}
                  onChange={setGift}
                />
                <motion.button
                  type="button"
                  onClick={goNext}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full ${choice.cta} py-3.5`}
                >
                  Continue
                </motion.button>
              </div>
            ) : null}

            {step === 2 ? (
              <div className={softCard}>
                <p className="font-jost text-sm text-brand-muted">How should we get this to you?</p>
                <div className="space-y-3">
                  {(
                    [
                      ["PICKUP", "Pickup"],
                      ["DELIVERY", "Delivery"],
                    ] as const
                  ).map(([id, label]) => (
                    <label
                      key={id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                        fulfillment === id
                          ? "border-brand-pink bg-[var(--surface-tint)]"
                          : "border-[var(--border-pink)] bg-[var(--surface-card)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="fulfillment"
                        checked={fulfillment === id}
                        onChange={() => setFulfillment(id)}
                        className="text-brand-pink focus:ring-brand-pink"
                      />
                      <span className="font-jost text-sm text-brand-text">{label}</span>
                    </label>
                  ))}
                </div>

                {fulfillment === "DELIVERY" ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-jost text-xs font-medium uppercase tracking-wide text-brand-dimmed">
                        Delivery zone &amp; fee
                      </p>
                      <p className="mt-1 font-jost text-xs text-brand-muted">
                        Accra deliveries arrive within 24-48 hours max after confirmation.
                      </p>
                      <ul className="mt-3 space-y-2">
                        {DELIVERY_ZONES.map((z) => (
                          <li key={z.id}>
                            <label
                              className={`flex cursor-pointer flex-col rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                                deliveryZoneId === z.id
                                  ? "border-brand-pink bg-[var(--surface-tint)]"
                                  : "border-[var(--border-pink)] bg-[var(--surface-card)]"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="deliveryZone"
                                  checked={deliveryZoneId === z.id}
                                  onChange={() => setDeliveryZoneId(z.id)}
                                  className="mt-1 text-brand-pink"
                                />
                                <div>
                                  <span className="font-jost text-sm font-medium text-brand-text">
                                    {z.label}
                                  </span>
                                  <span className="mt-0.5 block font-jost text-xs text-brand-muted">
                                    {z.area} · {z.eta}
                                  </span>
                                </div>
                              </div>
                              <span className="mt-2 shrink-0 font-jost text-sm font-semibold text-brand-text sm:mt-0">
                                GHS {z.riderFeeGhs}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {deliveryZoneId ? (
                      <div className="rounded-lg border border-brand-border bg-brand-surface p-3 font-jost text-sm">
                        <p className="text-brand-text">
                          Rider fee for this order:{" "}
                          <strong className="text-brand-pink">
                            GHS {selectedZone?.riderFeeGhs ?? "—"}
                          </strong>
                        </p>
                        <p className="mt-1 text-xs text-brand-muted">
                          This fee is included in your total before payment.
                        </p>
                      </div>
                    ) : null}
                    <ScheduledDeliveryFields
                      address={deliveryAddress}
                      onAddressChange={setDeliveryAddress}
                      date={deliveryDay}
                      onDateChange={setDeliveryDay}
                      timeSlot={deliveryTimeSlot}
                      onTimeSlotChange={setDeliveryTimeSlot}
                    />
                  </div>
                ) : null}

                {fulfillment === "PICKUP" ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[var(--border-pink)] bg-[var(--surface-tint-deep)] p-4 font-jost text-sm text-brand-muted">
                      Store hours: Monday to Saturday, 10:00 AM to 7:00 PM.
                      Pick your preferred day and time window, and the admin team will confirm.
                    </div>
                    <ScheduledDeliveryFields
                      address={deliveryAddress}
                      onAddressChange={setDeliveryAddress}
                      date={deliveryDay}
                      onDateChange={setDeliveryDay}
                      timeSlot={deliveryTimeSlot}
                      onTimeSlotChange={setDeliveryTimeSlot}
                      showAddress={false}
                      title="Pickup slot"
                      note="Choose a date and time range for pickup. We will confirm the slot."
                    />
                  </div>
                ) : null}

                {fulfillment === "DELIVERY" && !validateStep2() ? (
                  <p className="font-jost text-xs text-brand-pink">
                    Select the required fields to continue.
                  </p>
                ) : null}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card)] px-5 py-3 font-jost text-sm text-brand-text"
                  >
                    Back
                  </button>
                  <motion.button
                    type="button"
                    onClick={goNext}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex-1 ${choice.cta} py-3`}
                  >
                    Continue
                  </motion.button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className={softCard}>
                <h2 className="font-bebas text-xl tracking-wide text-brand-pink">Mobile Money (Momo)</h2>
                <p className="mt-1 font-jost text-sm text-brand-muted">
                  Choose your network. We&apos;ll take you to the secure pay screen on the next step.
                </p>
                <div className="mt-4 space-y-3">
                  {MOBILE_NETWORKS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        mobileNetwork === opt.id
                          ? "border-brand-pink bg-[var(--surface-tint)]"
                          : "border-[var(--border-pink)] bg-[var(--surface-card)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mobileNetwork"
                        checked={mobileNetwork === opt.id}
                        onChange={() => setMobileNetwork(opt.id)}
                        className="mt-1 text-brand-pink focus:ring-brand-pink"
                      />
                      <span>
                        <span className="block font-jost text-sm font-medium text-brand-text">{opt.label}</span>
                        <span className="mt-0.5 block font-jost text-xs text-brand-muted">{opt.sub}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {!mobileNetwork ? (
                  <p className="font-jost text-xs text-brand-pink">Pick the network on the phone you&apos;re paying from.</p>
                ) : null}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card)] px-5 py-3 font-jost text-sm"
                  >
                    Back
                  </button>
                  <motion.button
                    type="button"
                    onClick={goNext}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={!mobileNetwork}
                    className={`flex-1 ${choice.cta} py-3 disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Continue
                  </motion.button>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card)] p-6 font-jost text-sm">
                  <p className="text-brand-dimmed">Items</p>
                  <ul className="mt-2 space-y-2 text-brand-text">
                    {items.map((i) => (
                      <li
                        key={`${i.productId}-${i.size}-${i.color ?? ""}`}
                        className="flex justify-between gap-2 border-b border-[var(--surface-pop)] pb-2"
                      >
                        <span>
                          {i.name}{" "}
                          <span className="text-brand-muted">
                            ({[i.color, i.size].filter(Boolean).join(" · ")})
                          </span>
                        </span>
                        <span className="shrink-0">GHS {(i.unitPrice * i.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  {fulfillment === "DELIVERY" ? (
                    <p className="mt-4 text-xs text-brand-muted">
                      To: {deliveryAddress.slice(0, 80)}
                      {deliveryAddress.length > 80 ? "…" : ""} · {deliveryDayLabel} · {deliveryTimeSlot}
                    </p>
                  ) : null}
                  <p className="mt-4 text-brand-muted">
                    {fulfillment === "PICKUP" ? "Pickup fee: GHS 0" : `Delivery fee: GHS ${deliveryFee}`}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-brand-text">Total GHS {total.toFixed(2)}</p>
                  <p className="mt-3 text-brand-muted">
                    Payment: <span className="font-medium text-brand-text">Momo · {networkLabel}</span>
                  </p>
                  {gift.isGiftOrder ? (
                    <p className="mt-4 rounded-lg border border-brand-pink/30 bg-[var(--surface-tint)] p-3 text-xs text-brand-pink">
                      Gift order → delivery &amp; rider SMS use recipient phone. Buyer keeps receipt.
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card)] px-5 py-3 font-jost text-sm"
                  >
                    Back
                  </button>
                  <motion.button
                    type="button"
                    onClick={placeOrderAndPay}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || !mobileNetwork}
                    className={`relative flex-1 overflow-hidden ${choice.cta} py-3.5 disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="relative font-semibold">
                      {isSubmitting ? "Opening secure pay…" : "Continue to pay"}
                    </span>
                  </motion.button>
                </div>
                <p className="text-center font-jost text-[11px] text-brand-muted">
                  We&apos;ll redirect you to the secure pay screen to confirm with your Momo PIN.
                </p>
                {payErr ? <p className="text-sm text-rose-600">{payErr}</p> : null}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
