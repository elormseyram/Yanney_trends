import { updateScheduleApproval } from "@/app/actions/hub-orders";
import { humanizeEnum } from "@/lib/hub/format";
import type { HubOrderDetail, ScheduleStatus } from "@/lib/hub/types";

const PICKUP_LIKE = new Set(["PICKUP", "READY_FOR_PICKUP"]);

export function OrderScheduleApproval({ order }: { order: HubOrderDetail }) {
  if (!order.scheduled_date && !order.scheduled_slot) return null;

  const status: ScheduleStatus = (order.schedule_status ?? "PENDING") as ScheduleStatus;
  const isPickup = PICKUP_LIKE.has(order.fulfillment_type);
  const heading = isPickup ? "Pickup approval" : "Schedule approval";
  const intro = isPickup
    ? "The customer chose this pickup window. Approve or decline so they get a clear answer."
    : "The customer chose this delivery window. Approve or decline so they know what to expect.";

  const tone =
    status === "APPROVED"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
      : status === "DECLINED"
        ? "border-stone-300 bg-stone-50 text-stone-700 dark:border-stone-600 dark:bg-stone-800/40 dark:text-stone-200"
        : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100";

  const badgeLabel =
    status === "APPROVED"
      ? "Approved"
      : status === "DECLINED"
        ? "Declined"
        : "Awaiting your decision";

  return (
    <section className={`rounded-xl border p-5 ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{heading}</h2>
          <p className="mt-1 text-xs opacity-80">{intro}</p>
        </div>
        <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider dark:bg-black/30">
          {badgeLabel}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide opacity-70">Booked window</dt>
          <dd className="mt-0.5 font-medium">
            {order.scheduled_date ?? "—"}
            {order.scheduled_slot ? ` · ${order.scheduled_slot}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide opacity-70">
            Fulfilment
          </dt>
          <dd className="mt-0.5 font-medium">{humanizeEnum(order.fulfillment_type)}</dd>
        </div>
      </dl>

      {order.schedule_decision_note ? (
        <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs dark:bg-black/30">
          <span className="font-semibold">Note: </span>
          {order.schedule_decision_note}
        </p>
      ) : null}

      <form action={updateScheduleApproval} className="mt-4 space-y-3">
        <input type="hidden" name="orderId" value={order.id} />
        <div>
          <label
            htmlFor="decision_note"
            className="text-[11px] font-medium uppercase tracking-wide opacity-70"
          >
            Note for the customer (optional)
          </label>
          <textarea
            id="decision_note"
            name="decision_note"
            rows={2}
            defaultValue={order.schedule_decision_note ?? ""}
            placeholder="e.g. Confirmed — see you Saturday at 11am."
            className="mt-1 w-full rounded-lg border border-current/20 bg-white/80 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 dark:bg-stone-950/60 dark:text-stone-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="decision"
            value="APPROVED"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {status === "APPROVED" ? "Re-confirm approval" : "Approve"}
          </button>
          <button
            type="submit"
            name="decision"
            value="DECLINED"
            className="rounded-lg border border-current/30 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-white dark:bg-stone-950/40 dark:text-stone-100 dark:hover:bg-stone-950"
          >
            Decline
          </button>
          {status !== "PENDING" ? (
            <button
              type="submit"
              name="decision"
              value="PENDING"
              className="ml-auto text-xs font-medium underline-offset-2 hover:underline"
            >
              Reset to pending
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
