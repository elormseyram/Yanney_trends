import { updateOrderRider } from "@/app/actions/hub-orders";
import { humanizeEnum } from "@/lib/hub/format";
import type { HubOrderDetail, HubRiderRow } from "@/lib/hub/types";

const DELIVERY_LIKE = new Set(["DELIVERY", "RIDER"]);

export function OrderRiderAssign({
  order,
  riders,
}: {
  order: HubOrderDetail;
  riders: HubRiderRow[];
}) {
  const show = DELIVERY_LIKE.has(order.fulfillment_type);
  if (!show) return null;

  const currentId = order.delivery_rider_id ?? "";
  const activeRiders = riders.filter((r) => r.is_active);
  const currentRider = currentId ? riders.find((r) => r.id === currentId) : null;
  const selectRiders =
    currentRider && !currentRider.is_active
      ? [currentRider, ...activeRiders.filter((r) => r.id !== currentRider.id)]
      : activeRiders;

  return (
    <div className="border-t border-stone-200 pt-4 dark:border-stone-600">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Delivery rider</h3>
      <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
        Assign an active rider for this delivery. Export their run sheet from the Riders page (CSV or
        printable sheet).
      </p>
      {order.rider ? (
        <p className="mt-2 text-sm text-stone-700 dark:text-stone-200">
          Current:{" "}
          <span className="font-medium text-stone-900 dark:text-stone-100">
            {order.rider.display_name}
          </span>
          {order.rider.phone ? (
            <span className="text-stone-500 dark:text-stone-400"> · {order.rider.phone}</span>
          ) : null}
        </p>
      ) : (
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">No rider assigned yet.</p>
      )}
      <form action={updateOrderRider} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <input type="hidden" name="orderId" value={order.id} />
        <div className="min-w-0 flex-1">
          <label htmlFor="delivery_rider_id" className="sr-only">
            Select rider
          </label>
          <select
            id="delivery_rider_id"
            name="delivery_rider_id"
            defaultValue={currentId}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
          >
            <option value="">— Unassigned —</option>
            {selectRiders.map((r) => (
              <option key={r.id} value={r.id}>
                {r.display_name}
                {!r.is_active ? " (inactive)" : ""}
                {r.phone ? ` · ${r.phone}` : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
        >
          Save rider
        </button>
      </form>
      <p className="mt-2 text-[10px] text-stone-400">
        Fulfilment: {humanizeEnum(order.fulfillment_type)}
      </p>
    </div>
  );
}
