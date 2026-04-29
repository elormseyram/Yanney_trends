/**
 * Routes notification content for gift vs standard orders.
 * Wire to Resend / Africa's Talking when backends are connected.
 */

export interface OrderNotifyContext {
  orderRef: string;
  buyerPhone: string;
  buyerEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  isGiftOrder: boolean;
  hidePrice: boolean;
  status: string;
}

export function buyerSmsPayload(ctx: OrderNotifyContext): string {
  if (ctx.isGiftOrder) {
    return `Yanney Trends: Order ${ctx.orderRef} — ${ctx.status}. Payment & receipt sent to you. Thank you!`;
  }
  return `Yanney Trends: Order ${ctx.orderRef} — ${ctx.status}.`;
}

export function recipientSmsPayload(ctx: OrderNotifyContext): string | null {
  if (!ctx.isGiftOrder || !ctx.recipientPhone) return null;
  if (ctx.hidePrice) {
    return `Yanney Trends: A package is on its way to you 💖 Delivery update for order ${ctx.orderRef}.`;
  }
  return `Yanney Trends: Your order ${ctx.orderRef} is on the way.`;
}
