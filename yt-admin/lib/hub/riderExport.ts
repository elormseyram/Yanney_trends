import type { RiderOrderExportRow } from "@/lib/hub/queries";

export function summarizeOrderItems(items: unknown): string {
  if (!Array.isArray(items)) return "";
  return items
    .map((line: unknown) => {
      if (!line || typeof line !== "object") return "";
      const o = line as Record<string, unknown>;
      const q = Number(o.quantity ?? 1) || 1;
      const n = String(o.name ?? o.title ?? "Item");
      const sz = o.size ? ` (${String(o.size)})` : "";
      return `${q}× ${n}${sz}`;
    })
    .filter(Boolean)
    .join("; ");
}

export function csvEscape(cell: string): string {
  if (/[",\n\r]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

const CSV_HEADER = [
  "Order number",
  "Customer",
  "Phone",
  "Email",
  "Delivery address",
  "Items",
  "Total",
  "Currency",
  "Status",
  "Payment",
  "Fulfilment",
  "Placed at",
  "Scheduled",
] as const;

export function buildRiderOrdersCsv(riderName: string, orders: RiderOrderExportRow[]): string {
  const lines: string[] = [
    csvEscape(`Rider run sheet — ${riderName}`),
    csvEscape(`Generated — ${new Date().toISOString()}`),
    "",
    CSV_HEADER.map(csvEscape).join(","),
  ];
  for (const o of orders) {
    const sched = [o.scheduled_date ?? "", o.scheduled_slot ?? ""].filter(Boolean).join(" ");
    lines.push(
      [
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.customer_email ?? "",
        o.delivery_address ?? "",
        summarizeOrderItems(o.items),
        String(o.total),
        o.currency,
        o.status,
        o.payment_status,
        o.fulfillment_type,
        o.created_at,
        sched,
      ]
        .map((c) => csvEscape(String(c)))
        .join(","),
    );
  }
  return lines.join("\n");
}
