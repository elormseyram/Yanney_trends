import Link from "next/link";
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

function lineItemsFromOrder(
  items: unknown,
  currency: string,
): { name: string; qty: string; amount: string }[] {
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
      return {
        name,
        qty: String(qty),
        amount: amount > 0 ? formatMoney(amount, currency) : "—",
      };
    }
    return { name: `Item ${i + 1}`, qty: "1", amount: "—" };
  });
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
                <dt className="text-stone-500">Source / fulfilment</dt>
                <dd>
                  {humanizeEnum(o.source)} · {humanizeEnum(o.fulfillment_type)}
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

        <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">What they bought</h2>
          <p className="mt-1 text-xs text-stone-500">Sizes and pieces as recorded when the order was placed.</p>
          {lineRows.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">No line breakdown saved for this order.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-600">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead className="bg-stone-50 dark:bg-stone-800/80">
                  <tr>
                    <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Item</th>
                    <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Qty</th>
                    <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Line</th>
                  </tr>
                </thead>
                <tbody>
                  {lineRows.map((row, idx) => (
                    <tr key={idx} className="border-t border-stone-100 dark:border-stone-700">
                      <td className="px-3 py-2 text-stone-900 dark:text-stone-100">{row.name}</td>
                      <td className="px-3 py-2 tabular-nums text-stone-600 dark:text-stone-400">{row.qty}</td>
                      <td className="px-3 py-2 tabular-nums text-stone-900 dark:text-stone-100">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {o.gift_message ? (
          <section className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-5 dark:border-rose-500/30 dark:bg-rose-500/10">
            <h2 className="text-sm font-semibold text-rose-900 dark:text-rose-100">Gift message</h2>
            <p className="mt-2 text-sm text-stone-800 dark:text-stone-200">{o.gift_message}</p>
            {o.relationship ? (
              <p className="mt-1 text-xs text-stone-600">Relationship: {o.relationship}</p>
            ) : null}
          </section>
        ) : null}
      </main>
    </>
  );
}
