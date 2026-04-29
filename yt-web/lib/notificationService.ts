/**
 * Customer notifications (Resend, Africa's Talking, WhatsApp).
 * Implement send paths when env keys are present — see master prompt.
 */

export type OrderStatusLite =
  | "PENDING"
  | "CONFIRMED"
  | "PACKAGED"
  | "RIDER_ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "COLLECTED"
  | "CANCELLED"
  | "REFUNDED";

export async function notifyCustomer(
  order: { order_number: string; customer_name: string },
  status: OrderStatusLite,
): Promise<void> {
  void order;
  void status;
  /* Promise.allSettled([email, sms, whatsapp]) */
}
