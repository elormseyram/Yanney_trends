"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/hub-orders";
import { humanizeEnum } from "@/lib/hub/format";
import { ALL_ORDER_STATUSES } from "@/lib/hub/constants";

export function OrderStatusInlineSelect({
  orderId,
  defaultStatus,
}: {
  orderId: string;
  defaultStatus: string;
}) {
  const [status, setStatus] = useState(defaultStatus);
  const [isPending, startTransition] = useTransition();

  const submit = (next: string) => {
    setStatus(next);
    const fd = new FormData();
    fd.set("orderId", orderId);
    fd.set("status", next);
    fd.set("redirectTo", "/dashboard/orders");
    startTransition(() => {
      void updateOrderStatus(fd);
    });
  };

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => submit(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs text-stone-800 disabled:opacity-60 dark:border-stone-600 dark:bg-stone-950 dark:text-stone-100"
      aria-label="Update order status"
    >
      {ALL_ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {humanizeEnum(s)}
        </option>
      ))}
    </select>
  );
}
