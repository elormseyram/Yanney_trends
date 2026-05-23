/** Delivery windows and boutique pickup schedule. */

// ---------------------------------------------------------------------------
// Boutique pickup hours
// Mon–Fri: 10:00 – 20:00  |  Sat: 10:00 – 18:00  |  Sun: closed
// ---------------------------------------------------------------------------

/** Returns 1-hour pickup slots for a given YYYY-MM-DD date string. Empty on Sundays. */
export function getPickupTimeSlots(dateStr: string): string[] {
  if (!dateStr) return [];
  const date = new Date(dateStr + "T12:00:00"); // noon to avoid timezone edge cases
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0) return []; // closed Sunday
  const closeHour = day === 6 ? 18 : 20; // Sat 6pm, Mon–Fri 8pm
  const slots: string[] = [];
  for (let h = 10; h < closeHour; h++) {
    const start = `${String(h).padStart(2, "0")}:00`;
    const end = `${String(h + 1).padStart(2, "0")}:00`;
    slots.push(`${start} – ${end}`);
  }
  return slots;
}

/** Next available boutique pickup dates (skips Sundays). */
export function getPickupDateOptions(max = 14): DeliveryDateOption[] {
  return getDeliveryDateOptions(max); // already skips Sundays
}

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
