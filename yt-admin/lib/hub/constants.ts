import type { OrderStatus } from "@/lib/hub/types";

/** Counted as “open” on the overview card */
export const OPEN_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKAGED",
  "RIDER_ASSIGNED",
  "OUT_FOR_DELIVERY",
  "READY_FOR_PICKUP",
];

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKAGED",
  "RIDER_ASSIGNED",
  "OUT_FOR_DELIVERY",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "COLLECTED",
  "CANCELLED",
  "REFUNDED",
];

export const PRODUCT_CATEGORIES = [
  "DRESS",
  "TWO_PIECE_SET",
  "OUTFIT",
  "BAG",
  "HEELS",
  "SLIPPERS",
  "ACCESSORY",
] as const;
