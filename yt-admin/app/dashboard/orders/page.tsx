import Link from "next/link";
import { getHubRole } from "@/lib/hub-auth";
import { fetchOrdersList } from "@/lib/hub/queries";
import { formatMoney, formatDateTime } from "@/lib/hub/format";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { PaymentStatusBadge } from "@/components/hub/StatusBadge";
import { OrderStatusInlineSelect } from "@/components/hub/OrderStatusInlineSelect";
import { FormFlash } from "@/components/hub/FormFlash";

const PICKUP_LIKE = new Set(["PICKUP", "READY_FOR_PICKUP"]);

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;

  const { ok, err } = await searchParams;
  const res = await fetchOrdersList();

  return (
    <>
      <HubTopBar title="Orders" role={role} />
      <main className="flex-1 p-4 sm:p-6">
        <FormFlash err={err} ok={ok} />
        {!res.ok ? <QueryErrorBanner message={res.message} /> : null}

        <p className="text-sm text-stone-600 dark:text-stone-400">
          Latest 150 orders. Change status right from the list, or open a row for fulfilment details
          and pickup approvals.
        </p>

        <div className="mt-6 overflow-x-auto overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-stone-100 dark:bg-stone-800">
              <tr>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Reference</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Customer</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Status</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Payment</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Schedule</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Rider</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Total</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">When</th>
                <th className="px-4 py-3 text-right font-medium text-stone-700 dark:text-stone-300">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-900">
              {res.ok && res.data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-stone-500 dark:text-stone-400">
                    No orders yet. New orders from the website will show up here.
                  </td>
                </tr>
              ) : null}
              {res.ok
                ? res.data.map((o) => {
                    const needsApproval =
                      Boolean(o.scheduled_date) &&
                      (o.schedule_status ?? "PENDING") === "PENDING" &&
                      PICKUP_LIKE.has(o.fulfillment_type);
                    return (
                      <tr key={o.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/60">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/orders/${o.id}`}
                            className="font-medium text-rose-600 hover:underline dark:text-rose-400"
                          >
                            {o.order_number}
                          </Link>
                          {o.is_gift_order ? (
                            <span className="ml-2 text-[10px] font-medium uppercase text-rose-500">
                              Gift
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-stone-700 dark:text-stone-200">
                          <div>{o.customer_name}</div>
                          {o.customer_email ? (
                            <div className="text-xs text-stone-500">{o.customer_email}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <OrderStatusInlineSelect orderId={o.id} defaultStatus={o.status} />
                        </td>
                        <td className="px-4 py-3">
                          <PaymentStatusBadge status={o.payment_status} />
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {o.scheduled_date ? (
                            <div className="space-y-0.5">
                              <div className="text-stone-700 dark:text-stone-200">
                                {o.scheduled_date}
                                {o.scheduled_slot ? ` · ${o.scheduled_slot}` : ""}
                              </div>
                              <ScheduleBadge status={o.schedule_status ?? "PENDING"} highlight={needsApproval} />
                            </div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                        <td className="max-w-[140px] px-4 py-3 text-xs text-stone-600 dark:text-stone-300">
                          {o.rider_display_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                          {formatMoney(Number(o.total ?? 0), o.currency)}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                          {formatDateTime(o.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/orders/${o.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

function ScheduleBadge({
  status,
  highlight,
}: {
  status: string;
  highlight: boolean;
}) {
  const tone =
    status === "APPROVED"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
      : status === "DECLINED"
        ? "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200"
        : highlight
          ? "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400";
  const label =
    status === "APPROVED"
      ? "Approved"
      : status === "DECLINED"
        ? "Declined"
        : "Awaiting approval";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>
      {label}
    </span>
  );
}
