/** Ghana delivery zones — extend with Accra keywords */
export const ZONE_KEYWORDS = {
  A: [
    "dansoman",
    "accra",
    "labadi",
    "osu",
    "east legon",
    "airport",
    "circle",
    "kaneshie",
  ],
  B: ["tema", "kasoa", "madina", "adenta", "spintex", "ashaiman"],
  C: [] as string[],
} as const;

export type DeliveryZone = "A" | "B" | "C";

export interface ShopDeliverySettings {
  zone_a_fee: number;
  zone_b_fee: number;
  zone_c_fee: number;
}

const defaultFees: ShopDeliverySettings = {
  zone_a_fee: 25,
  zone_b_fee: 40,
  zone_c_fee: 60,
};

export function detectZone(address: string): DeliveryZone {
  const lower = address.toLowerCase();
  for (const kw of ZONE_KEYWORDS.A) {
    if (lower.includes(kw)) return "A";
  }
  for (const kw of ZONE_KEYWORDS.B) {
    if (lower.includes(kw)) return "B";
  }
  return "C";
}

export function getDeliveryFee(zone: DeliveryZone, settings: ShopDeliverySettings = defaultFees): number {
  if (zone === "A") return settings.zone_a_fee;
  if (zone === "B") return settings.zone_b_fee;
  return settings.zone_c_fee;
}

export function getEstimatedDelivery(zone: DeliveryZone): string {
  if (zone === "A") return "Same day or next day (Greater Accra)";
  if (zone === "B") return "1–2 business days";
  return "2–5 business days nationwide";
}
