"use client";

import Image from "next/image";

export type ReceiptOrder = {
  order_number: string | null;
  customer_name: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  fulfillment_type?: string | null;
  status?: string | null;
  delivery_address?: string | null;
  scheduled_date?: string | null;
  scheduled_slot?: string | null;
  is_gift_order?: boolean | null;
  payment_method?: string | null;
  items: unknown;
  subtotal: number | null;
  delivery_fee: number | null;
  discount_amount: number | null;
  total: number | null;
  currency: string | null;
  created_at: string | null;
  payment_status: string | null;
};

type LineItem = {
  name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
  imageUrl: string | null;
};

function fmt(amount: number | null | undefined, currency: string | null | undefined) {
  const value = Number(amount ?? 0);
  const code = (currency ?? "GHS").toUpperCase();
  return `${code} ${value.toFixed(2)}`;
}

function asString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  return String(v);
}

function asNumber(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

function normalizeItems(rawItems: unknown): LineItem[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map((raw, idx) => {
    const row = (raw ?? {}) as Record<string, unknown>;
    const qty = Math.max(1, Math.round(asNumber(row.quantity ?? row.qty ?? 1) || 1));
    const unitPrice = asNumber(row.price ?? row.unit_price ?? row.unitPrice);
    const lineRaw = asNumber(row.line_total ?? row.subtotal ?? row.lineTotal);
    return {
      name: asString(row.name ?? row.title) ?? `Item ${idx + 1}`,
      size: asString(row.size),
      color: asString(row.color),
      quantity: qty,
      unitPrice,
      amount: lineRaw > 0 ? lineRaw : unitPrice * qty,
      imageUrl: asString(row.image_url ?? row.imageUrl ?? row.image),
    };
  });
}

function fulfillmentLabel(order: ReceiptOrder): string {
  const t = (order.fulfillment_type ?? "").toUpperCase();
  if (t === "PICKUP") {
    const date = order.scheduled_date;
    const slot = order.scheduled_slot;
    if (date && slot) return `Pickup · ${date} · ${slot}`;
    if (date) return `Pickup · ${date}`;
    return "Pickup at boutique";
  }
  if (t === "DELIVERY") {
    const date = order.scheduled_date;
    const slot = order.scheduled_slot;
    if (date && slot) return `Delivery · ${date} · ${slot}`;
    if (date) return `Delivery · ${date}`;
    return "Delivery";
  }
  return "—";
}

function paymentLabel(order: ReceiptOrder): string {
  const m = (order.payment_method ?? "").toString().toLowerCase();
  if (m.includes("paystack") || m.includes("momo") || m.includes("mobile"))
    return "Mobile Money (Momo)";
  if (m) return m;
  return "Mobile Money";
}

export function InvoiceReceipt({ order }: { order: ReceiptOrder }) {
  const items = normalizeItems(order.items);
  const placedAt = order.created_at ? new Date(order.created_at) : null;
  const subtotal = Number(order.subtotal ?? 0);
  const deliveryFee = Number(order.delivery_fee ?? 0);
  const discount = Number(order.discount_amount ?? 0);
  const total = Number(order.total ?? subtotal + deliveryFee - discount);
  const isPaid = (order.payment_status ?? "").toUpperCase() === "PAID";

  return (
    <article className="checkout-invoice-print relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-[var(--border-pink)] bg-[var(--surface-card-soft)] p-7 sm:p-8">
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-bl-[36px] bg-brand-pink/20 print:hidden"
        aria-hidden
      />

      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bebas text-xs tracking-[0.4em] text-brand-pink">YANNEY TRENDS</p>
          <h2 className="mt-1.5 font-playfair text-2xl text-brand-text">Order receipt</h2>
          <p className="mt-1 font-jost text-[11px] text-brand-muted">
            Dansoman, Accra · hello@yanneytrends.com
          </p>
        </div>
        {isPaid ? (
          <span className="shrink-0 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 font-jost text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            Paid
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-jost text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Pending
          </span>
        )}
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-dashed border-[var(--border-pink)] py-4 font-jost text-sm">
        <div>
          <dt className="text-brand-dimmed text-[11px] uppercase tracking-wide">Order #</dt>
          <dd className="mt-0.5 font-semibold text-brand-text">{order.order_number ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-brand-dimmed text-[11px] uppercase tracking-wide">Date</dt>
          <dd className="mt-0.5 text-brand-text">
            {placedAt ? placedAt.toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" }) : "—"}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-brand-dimmed text-[11px] uppercase tracking-wide">Customer</dt>
          <dd className="mt-0.5 text-brand-text">
            {order.customer_name || "—"}
            {order.customer_phone ? ` · ${order.customer_phone}` : ""}
            {order.customer_email ? ` · ${order.customer_email}` : ""}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-brand-dimmed text-[11px] uppercase tracking-wide">Fulfillment</dt>
          <dd className="mt-0.5 text-brand-text">{fulfillmentLabel(order)}</dd>
        </div>
        {order.delivery_address ? (
          <div className="col-span-2">
            <dt className="text-brand-dimmed text-[11px] uppercase tracking-wide">Delivery to</dt>
            <dd className="mt-0.5 text-brand-text">{order.delivery_address}</dd>
          </div>
        ) : null}
        <div className="col-span-2">
          <dt className="text-brand-dimmed text-[11px] uppercase tracking-wide">Payment</dt>
          <dd className="mt-0.5 text-brand-text">{paymentLabel(order)}</dd>
        </div>
        {order.is_gift_order ? (
          <div className="col-span-2 rounded-lg border border-brand-pink/40 bg-[var(--surface-tint)] px-3 py-2 font-jost text-xs text-brand-pink">
            Gift order — packaging may hide price from recipient.
          </div>
        ) : null}
      </dl>

      {items.length > 0 ? (
        <ul className="mt-5 divide-y divide-[var(--border-pink)]/60 font-jost text-sm">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-start gap-3 py-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border-pink)] bg-brand-elevated">
                {it.imageUrl ? (
                  <Image
                    src={it.imageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-brand-dimmed">
                    —
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-brand-text">{it.name}</p>
                <p className="mt-0.5 text-[11px] text-brand-muted">
                  {[it.color, it.size, `Qty ${it.quantity}`].filter(Boolean).join(" · ")}
                </p>
                {it.unitPrice > 0 ? (
                  <p className="text-[11px] text-brand-dimmed">{fmt(it.unitPrice, order.currency)} each</p>
                ) : null}
              </div>
              <span className="shrink-0 text-right font-medium tabular-nums text-brand-text">
                {it.amount > 0 ? fmt(it.amount, order.currency) : "—"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 font-jost text-sm text-brand-muted">No items recorded for this order yet.</p>
      )}

      <dl className="mt-5 space-y-1 border-t border-[var(--border-pink)] pt-4 font-jost text-sm">
        <div className="flex justify-between">
          <dt className="text-brand-muted">Subtotal</dt>
          <dd className="tabular-nums text-brand-text">{fmt(subtotal, order.currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-brand-muted">Delivery</dt>
          <dd className="tabular-nums text-brand-text">{fmt(deliveryFee, order.currency)}</dd>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between">
            <dt className="text-brand-muted">Discount</dt>
            <dd className="tabular-nums text-brand-text">-{fmt(discount, order.currency)}</dd>
          </div>
        ) : null}
        <div className="mt-2 flex justify-between border-t border-dashed border-[var(--border-pink)] pt-2 text-base font-semibold">
          <dt className="text-brand-text">Total</dt>
          <dd className="tabular-nums text-brand-pink">{fmt(total, order.currency)}</dd>
        </div>
      </dl>

      <p className="mt-7 text-center font-jost text-[10px] tracking-wide text-brand-dimmed">
        Thank you for shopping with us — Yanney Trends · Dansoman, Accra
      </p>
    </article>
  );
}
