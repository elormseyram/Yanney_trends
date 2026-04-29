import { humanizeEnum } from "@/lib/hub/format";

const statusTone: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  CONFIRMED: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
  PACKAGED: "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200",
  RIDER_ASSIGNED: "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200",
  READY_FOR_PICKUP: "bg-teal-100 text-teal-900 dark:bg-teal-500/20 dark:text-teal-200",
  DELIVERED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  COLLECTED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  CANCELLED: "bg-stone-200 text-stone-800 dark:bg-stone-600 dark:text-stone-100",
  REFUNDED: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
};

const paymentTone: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  PAID: "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  FAILED: "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-200",
  REFUNDED: "bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-200",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const cls = statusTone[status] ?? "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {humanizeEnum(status)}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const cls =
    paymentTone[status] ?? "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {humanizeEnum(status)}
    </span>
  );
}
