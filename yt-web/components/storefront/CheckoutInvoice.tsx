"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CartItem } from "@/store/cartStore";

interface CheckoutInvoiceProps {
  orderRef: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  fulfillmentLabel: string;
  paymentMethodLabel?: string;
  isGift: boolean;
  placedAt: string;
  deliveryAddress?: string | null;
  deliveryWindow?: string | null;
}

export function CheckoutInvoice({
  orderRef,
  buyerName,
  buyerPhone,
  buyerEmail,
  items,
  subtotal,
  deliveryFee,
  total,
  fulfillmentLabel,
  paymentMethodLabel,
  isGift,
  placedAt,
  deliveryAddress,
  deliveryWindow,
}: CheckoutInvoiceProps) {
  return (
    <motion.div
      id="checkout-invoice"
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="checkout-invoice-print relative mx-auto max-w-lg rounded-xl border border-[#f3b8cc] bg-[#fffafd] p-8 shadow-[0_20px_60px_rgba(255,105,160,0.12)]"
      style={{ perspective: 1200 }}
    >
      <div className="absolute -right-1 -top-1 h-16 w-16 rounded-bl-full bg-brand-pink/25 print:hidden" aria-hidden />
      <p className="font-bebas text-xs tracking-[0.4em] text-brand-pink">YANNEY TRENDS</p>
      <h2 className="mt-2 font-playfair text-2xl text-brand-text">Order receipt</h2>
      <p className="mt-1 font-jost text-xs text-brand-muted">Bring this to the shop as proof of purchase (demo).</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-dashed border-[#f3b8cc] py-4 font-jost text-sm">
        <div>
          <dt className="text-brand-dimmed">Order #</dt>
          <dd className="font-semibold text-brand-text">{orderRef}</dd>
        </div>
        <div>
          <dt className="text-brand-dimmed">Date</dt>
          <dd className="text-brand-text">{placedAt}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-brand-dimmed">Customer</dt>
          <dd className="text-brand-text">
            {buyerName} · {buyerPhone}
            {buyerEmail ? ` · ${buyerEmail}` : ""}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-brand-dimmed">Fulfillment</dt>
          <dd className="text-brand-text">{fulfillmentLabel}</dd>
        </div>
        {paymentMethodLabel ? (
          <div className="col-span-2">
            <dt className="text-brand-dimmed">Payment</dt>
            <dd className="text-brand-text">{paymentMethodLabel}</dd>
          </div>
        ) : null}
        {deliveryAddress ? (
          <div className="col-span-2">
            <dt className="text-brand-dimmed">Delivery to</dt>
            <dd className="text-brand-text">{deliveryAddress}</dd>
          </div>
        ) : null}
        {deliveryWindow ? (
          <div className="col-span-2">
            <dt className="text-brand-dimmed">Window</dt>
            <dd className="text-brand-text">{deliveryWindow}</dd>
          </div>
        ) : null}
        {isGift ? (
          <div className="col-span-2 rounded-lg border border-brand-pink/35 bg-[#fff5f9] px-3 py-2 font-jost text-xs text-brand-pink">
            Gift order — packaging may hide price from recipient.
          </div>
        ) : null}
      </dl>

      <table className="mt-4 w-full font-jost text-sm">
        <thead>
          <tr className="border-b border-[#f3b8cc] text-left text-[10px] uppercase tracking-wide text-brand-dimmed">
            <th className="w-12 pb-2 pr-2" aria-hidden />
            <th className="pb-2 pr-2">Item</th>
            <th className="pb-2 pr-2">Size</th>
            <th className="pb-2 pr-2 text-right">Qty</th>
            <th className="pb-2 text-right">Line</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr
              key={`${i.productId}-${i.size}-${i.color ?? ""}`}
              className="border-b border-[#fce4ec]/80"
            >
              <td className="py-2 pr-2 align-middle">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[#fce4ec] bg-white">
                  {i.imageUrl ? (
                    <Image
                      src={i.imageUrl}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>
              </td>
              <td className="py-2 pr-2 align-middle text-brand-text">{i.name}</td>
              <td className="py-2 pr-2 align-middle text-brand-muted">{i.size}</td>
              <td className="py-2 pr-2 text-right align-middle text-brand-muted">{i.quantity}</td>
              <td className="py-2 text-right align-middle font-medium text-brand-text">
                GHS {(i.unitPrice * i.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 space-y-1 font-jost text-sm">
        <div className="flex justify-between text-brand-muted">
          <span>Subtotal</span>
          <span>GHS {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-brand-muted">
          <span>Delivery (boutique)</span>
          <span>GHS {deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-[#f3b8cc] pt-2 text-base font-semibold text-brand-text">
          <span>Total</span>
          <span>GHS {total.toFixed(2)}</span>
        </div>
      </div>

      <p className="mt-6 text-center font-jost text-[10px] text-brand-dimmed">
        Thank you — Yanney Trends · Dansoman, Accra
      </p>
    </motion.div>
  );
}
