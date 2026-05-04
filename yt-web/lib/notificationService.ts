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

export interface OrderNotificationPayload {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  total?: number | null;
  currency?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: any[];
}

function normalizeGhanaPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "+233" + cleaned.slice(1);
  if (cleaned.startsWith("233")) return "+" + cleaned;
  if (!cleaned.startsWith("+")) return "+" + cleaned;
  return phone;
}

function buildSMSMessage(order: OrderNotificationPayload, status: OrderStatusLite): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yanneytrendss.vercel.app";
  const trackUrl = `${siteUrl}/track/${order.order_number}`;

  if (status === "CONFIRMED" || status === "PENDING") {
    let msg = `Hi ${order.customer_name}! Thank you for your purchase. We hope you love your order and please do well to keep track of your status on the website as well.`;

    if (order.total != null) {
      msg += `\nTotal: ${order.currency || "GHS"} ${Number(order.total).toFixed(2)}`;
    }
    if (order.items && order.items.length > 0) {
      // Map items to a short format (e.g. "1x Dress, 2x Bag")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itemNames = order.items.map((i: any) => `${i.quantity || 1}x ${i.name || "Item"}`);
      let itemsStr = itemNames.join(", ");
      if (itemsStr.length > 60) itemsStr = itemsStr.substring(0, 57) + "...";
      msg += `\nItems: ${itemsStr}`;
    }
    msg += `\nTrack: ${trackUrl}`;
    return msg;
  }

  // For all other statuses (PACKAGED, RIDER_ASSIGNED, OUT_FOR_DELIVERY, etc.)
  // Automatically converts "OUT_FOR_DELIVERY" to "out for delivery"
  const formattedStatus = status.replace(/_/g, " ").toLowerCase();
  return `Hello ${order.customer_name}, your order ${order.order_number} is now ${formattedStatus}.\nTrack: ${trackUrl}`;
}

async function sendSMS(order: OrderNotificationPayload, status: OrderStatusLite) {
  if (!process.env.ARKESEL_SMS_API_KEY) {
    console.warn("[Notify] Arkesel API key not configured — skipping SMS");
    return;
  }

  try {
    const message = buildSMSMessage(order, status);
    // Arkesel expects the phone number without the '+' symbol (e.g., 23354XXXXXXX)
    const to = normalizeGhanaPhone(order.customer_phone).replace("+", "");

    const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": process.env.ARKESEL_SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Use "Arkesel" as a fallback since unapproved sender IDs will cause the API to fail
        sender: process.env.ARKESEL_SENDER_ID || "Arkesel",
        message: message,
        recipients: [to],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Arkesel API Error: ${response.status} - ${errorText}`);
    }

    console.log(`[Notify] SMS sent to ${to} for order ${order.order_number}`);
  } catch (error) {
    console.error("[Notify] Error sending SMS:", error);
  }
}

export async function notifyCustomer(
  order: OrderNotificationPayload,
  status: OrderStatusLite,
): Promise<void> {
  await Promise.allSettled([
    sendSMS(order, status)
  ]);
}
