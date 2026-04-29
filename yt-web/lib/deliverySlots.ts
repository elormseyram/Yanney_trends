/** Demo delivery windows — replace with `shop_settings` from DB. */

export const DELIVERY_TIME_SLOTS = [
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 19:00",
] as const;

export type DeliveryTimeSlot = (typeof DELIVERY_TIME_SLOTS)[number];

export interface DeliveryDateOption {
  value: string;
  label: string;
}

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Next available slots: skip Sundays; cap count for the select. */
export function getDeliveryDateOptions(max = 12): DeliveryDateOption[] {
  const out: DeliveryDateOption[] = [];
  const start = new Date();
  for (let add = 1; out.length < max && add < 45; add++) {
    const d = new Date(start);
    d.setDate(start.getDate() + add);
    if (d.getDay() === 0) continue;
    const value = localYmd(d);
    const label = d.toLocaleDateString("en-GH", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    out.push({ value, label });
  }
  return out;
}
