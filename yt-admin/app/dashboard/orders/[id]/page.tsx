import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getHubRole } from "@/lib/hub-auth";
import { fetchOrderById, fetchRidersList } from "@/lib/hub/queries";
import { formatMoney, formatDateTime, humanizeEnum } from "@/lib/hub/format";
import { ALL_ORDER_STATUSES } from "@/lib/hub/constants";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/hub/StatusBadge";
import { updateOrderPaymentStatus, updateOrderStatus } from "@/app/actions/hub-orders";
import { FormFlash } from "@/components/hub/FormFlash";
import { OrderRiderAssign } from "@/components/hub/OrderRiderAssign";
import { OrderScheduleApproval } from "@/components/hub/OrderScheduleApproval";

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

type LineRow = {
  name: string;
  size: string;
  color: string;
  qty: string;
  amount: string;
  imageUrl: string | null;
  lineNotes: string | null;
};

function lineItemsFromOrder(items: unknown, currency: string): LineRow[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((row, i) => {
    if (row && typeof row === "object") {
      const o = row as Record<string, unknown>;
      const name = String(o.name ?? o.title ?? o.product_name ?? o.productName ?? `Item ${i + 1}`);
      const qtyRaw = o.quantity ?? o.qty ?? 1;
      const qty = typeof qtyRaw === "number" ? qtyRaw : Number.parseFloat(String(qtyRaw)) || 1;
      const priceRaw = o.price ?? o.unit_price ?? o.unitPrice;
      const subRaw = o.subtotal ?? o.line_total ?? o.lineTotal;
      let amount = 0;
      if (typeof subRaw === "number" && !Number.isNaN(subRaw)) amount = subRaw;
      else if (typeof priceRaw === "number" && !Number.isNaN(priceRaw)) amount = priceRaw * qty;
      else if (typeof priceRaw === "string") {
        const p = Number.parseFloat(priceRaw);
        if (!Number.isNaN(p)) amount = p * qty;
      }
      const size = String(o.size ?? "").trim() || "—";
      const colorRaw = o.color ?? o.colour ?? o.colorway;
      const color =
        colorRaw == null || colorRaw === "" ? "—" : String(colorRaw).trim() || "—";
      const noteRaw = o.notes ?? o.customer_note ?? o.line_note ?? o.note;
      const lineNotes =
        typeof noteRaw === "string" && noteRaw.trim() ? noteRaw.trim() : null;
      return {
        name,
        size,
        color,
        qty: String(qty),
        amount: amount > 0 ? formatMoney(amount, currency) : "—",
        imageUrl: String(o.image_url ?? o.imageUrl ?? o.image ?? "").trim() || null,
        lineNotes,
      };
    }
    return {
      name: `Item ${i + 1}`,
      size: "—",
      color: "—",
      qty: "1",
      amount: "—",
      imageUrl: null,
      lineNotes: null,
    };
  });
}

function firstNonEmptyString(...vals: unknown[]): string | null {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function orderMeta(o: { metadata?: unknown }) {
  const m =
    o.metadata && typeof o.metadata === "object" && !Array.isArray(o.metadata)
      ? (o.metadata as Record<string, unknown>)
      : {};
  const gr = m.gift_recipient;
  const giftRecipient =
    gr && typeof gr === "object" && !Array.isArray(gr) ? (gr as Record<string, unknown>) : null;
  return {
    customerOrderNotes:
      typeof m.customer_order_notes === "string" && m.customer_order_notes.trim()
        ? m.customer_order_notes.trim()
        : null,
    giftDeliveryNotes: firstNonEmptyString(
      m.gift_delivery_notes,
      m.recipient_delivery_notes,
      m.delivery_notes_for_recipient,
      m.gift_delivery_instructions,
    ),
    giftRecipient,
  };
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const { id } = await params;
  const flash = await searchParams;
  const role = await getHubRole();
  if (!role) return null;

  const res = await fetchOrderById(id);
  if (!res.ok && res.message === "Order not found") notFound();
  if (!res.ok) {
    return (
      <>
        <HubTopBar title="Order" role={role} />
        <main className="flex-1 p-4 sm:p-6">
          <QueryErrorBanner message={res.message} />
          <Link
            href="/dashboard/orders"
            className="mt-4 inline-block text-sm text-rose-600 hover:underline dark:text-rose-400"
          >
            ← Back to orders
          </Link>
        </main>
      </>
    );
  }

  const o = res.data;
  const lineRows = lineItemsFromOrder(o.items, o.currency);
  const meta = orderMeta(o);
  const ridersRes = await fetchRidersList(false);
  const riders = ridersRes.ok ? ridersRes.data : [];

  return (
    <>
      <HubTopBar title={o.order_number} role={role} />
      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <FormFlash err={flash.err} ok={flash.ok} />
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="text-sm text-rose-600 hover:underline dark:text-rose-400"
          >
            ← All orders
          </Link>
          <OrderStatusBadge status={o.status} />
          <PaymentStatusBadge status={o.payment_status} />
          {o.is_gift_order ? (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-500/20 dark:text-rose-200">
              Gift order
            </span>
          ) : null}
          {o.scheduled_date && (o.schedule_status ?? "PENDING") === "PENDING" ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
              Awaiting schedule approval
            </span>
          ) : null}
        </div>

        <OrderScheduleApproval order={o} />

        <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">What they bought</h2>
          <p className="mt-1 text-xs text-stone-500">Sizes and pieces as recorded when the order was placed.</p>
          {lineRows.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">No line breakdown saved for this order.</p>
          ) : (
            <div className="-mx-3 mt-4 overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-600 sm:mx-0">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-stone-50 dark:bg-stone-800/80">
                  <tr>
                    <th className="w-14 px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Image</th>
                    <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Item</th>
                    <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Size</th>
                    <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Colour</th>
                    <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Qty</th>
                    <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Line</th>
                    <th className="min-w-[120px] px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {lineRows.map((row, idx) => (
                    <tr key={idx} className="border-t border-stone-100 dark:border-stone-700">
                      <td className="px-3 py-2">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
                          {row.imageUrl ? (
                            <Image
                              src={row.imageUrl}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-stone-900 dark:text-stone-100">{row.name}</td>
                      <td className="px-3 py-2 text-stone-600 dark:text-stone-400">{row.size}</td>
                      <td className="px-3 py-2 text-stone-600 dark:text-stone-400">{row.color}</td>
                      <td className="px-3 py-2 tabular-nums text-stone-600 dark:text-stone-400">{row.qty}</td>
                      <td className="px-3 py-2 tabular-nums text-stone-900 dark:text-stone-100">{row.amount}</td>
                      <td className="px-3 py-2 text-xs text-stone-600 dark:text-stone-400">
                        {row.lineNotes ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900 lg:col-span-2">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Customer</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-stone-500">Name</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-100">{o.customer_name}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Phone</dt>
                <dd>{o.customer_phone}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Email</dt>
                <dd>{o.customer_email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Placed</dt>
                <dd>{formatDateTime(o.created_at)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Fulfilment</dt>
                <dd>
                  {o.source ? `${humanizeEnum(o.source)} · ` : ""}
                  {humanizeEnum(o.fulfillment_type)}
                </dd>
              </div>
              {o.delivery_address ? (
                <div>
                  <dt className="text-stone-500">Delivery</dt>
                  <dd className="whitespace-pre-wrap">{o.delivery_address}</dd>
                </div>
              ) : null}
              {o.scheduled_slot ? (
                <div>
                  <dt className="text-stone-500">Schedule</dt>
                  <dd>
                    {o.scheduled_date ?? ""} {o.scheduled_slot}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Totals</h2>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="text-stone-500">Subtotal</span>
                <span>{formatMoney(Number(o.subtotal ?? 0), o.currency)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-stone-500">Delivery</span>
                <span>{formatMoney(Number(o.delivery_fee), o.currency)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-stone-500">Discount</span>
                <span>{formatMoney(Number(o.discount_amount ?? 0), o.currency)}</span>
              </li>
              <li className="flex justify-between border-t border-stone-200 pt-2 font-semibold dark:border-stone-600">
                <span>Total</span>
                <span>{formatMoney(Number(o.total ?? 0), o.currency)}</span>
              </li>
            </ul>

            <div className="border-t border-stone-200 pt-4 dark:border-stone-600">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Order status
              </h3>
              <form action={updateOrderStatus} className="mt-2 flex flex-col gap-2">
                <input type="hidden" name="orderId" value={o.id} />
                <select
                  name="status"
                  defaultValue={o.status}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                >
                  {ALL_ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {humanizeEnum(s)}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-500 py-2 text-sm font-medium text-white hover:bg-rose-600"
                >
                  Update status
                </button>
              </form>
            </div>

            <OrderRiderAssign order={o} riders={riders} />

            <div className="border-t border-stone-200 pt-4 dark:border-stone-600">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Payment status
              </h3>
              <form action={updateOrderPaymentStatus} className="mt-2 flex flex-col gap-2">
                <input type="hidden" name="orderId" value={o.id} />
                <select
                  name="payment_status"
                  defaultValue={o.payment_status}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {humanizeEnum(s)}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg border border-stone-300 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-100 dark:hover:bg-stone-800"
                >
                  Update payment
                </button>
              </form>
            </div>
          </section>
        </div>

        {meta.customerOrderNotes || meta.giftRecipient ? (
          <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Customer notes</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {meta.customerOrderNotes ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Order notes</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-stone-800 dark:text-stone-200">
                    {meta.customerOrderNotes}
                  </dd>
                </div>
              ) : null}
              {meta.giftRecipient ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Gift recipient</dt>
                  <dd className="mt-1 space-y-0.5 text-stone-800 dark:text-stone-200">
                    {meta.giftRecipient.name ? <p>Name: {String(meta.giftRecipient.name)}</p> : null}
                    {meta.giftRecipient.phone ? <p>Phone: {String(meta.giftRecipient.phone)}</p> : null}
                    {meta.giftRecipient.city ? <p>City: {String(meta.giftRecipient.city)}</p> : null}
                    {meta.giftRecipient.address ? (
                      <p className="whitespace-pre-wrap">Address: {String(meta.giftRecipient.address)}</p>
                    ) : null}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}

        {o.is_gift_order || o.gift_message || meta.giftDeliveryNotes || o.relationship ? (
          <section className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-5 dark:border-rose-500/30 dark:bg-rose-500/10">
            <h2 className="text-sm font-semibold text-rose-900 dark:text-rose-100">Gift and recipient</h2>
            {meta.giftDeliveryNotes ? (
              <div className="mt-3 rounded-lg border border-rose-200/60 bg-white/60 p-3 dark:border-rose-500/25 dark:bg-rose-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-900 dark:text-rose-200">
                  Delivery notes (for the person they are buying for)
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800 dark:text-stone-200">
                  {meta.giftDeliveryNotes}
                </p>
              </div>
            ) : null}
            {o.gift_message ? (
              <div className={meta.giftDeliveryNotes ? "mt-4" : "mt-3"}>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-900 dark:text-rose-200">
                  Gift card message
                </p>
                <p className="mt-2 text-sm text-stone-800 dark:text-stone-200">{o.gift_message}</p>
              </div>
            ) : null}
            {o.relationship ? (
              <p className="mt-3 text-xs text-stone-600 dark:text-stone-400">Relationship: {o.relationship}</p>
            ) : null}
          </section>
        ) : null}
      </main>
    </>
  );
}
