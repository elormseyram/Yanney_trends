import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutIntentPayload = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  fulfillment_type: "PICKUP" | "DELIVERY";
  delivery_address?: string | null;
  delivery_zone?: string | null;
  scheduled_date?: string | null;
  scheduled_slot?: string | null;
  items: unknown[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency?: string;
  is_gift_order?: boolean;
  gift_message?: string | null;
  relationship?: string | null;
};

type AdminClient = ReturnType<typeof createAdminClient>;

const REQUIRED_COLUMNS = new Set([
  "order_number",
  "customer_name",
  "customer_phone",
  "status",
  "payment_status",
  "items",
  "total",
  "subtotal",
  "currency",
  "fulfillment_type",
]);

function extractMissingColumn(message: string): string | null {
  if (!message) return null;
  const m1 = /column\s+"([^"]+)"[^]*does not exist/i.exec(message);
  if (m1?.[1]) return m1[1];
  const m2 = /column\s+(?:[\w]+\.)?([A-Za-z_][\w]*)\s+does not exist/i.exec(message);
  if (m2?.[1]) return m2[1];
  const m3 = /Could not find the ['"]([^'"]+)['"] column of\s+['"][^'"]+['"]\s+in the schema cache/i.exec(
    message,
  );
  if (m3?.[1]) return m3[1];
  const m4 = /Could not find the column ['"]([^'"]+)['"]/i.exec(message);
  if (m4?.[1]) return m4[1];
  return null;
}

async function insertOrderResilient(
  admin: AdminClient,
  baseRow: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  let row: Record<string, unknown> = { ...baseRow };
  for (let attempt = 0; attempt < 12; attempt++) {
    const { error } = await admin.from("orders").insert(row);
    if (!error) return { ok: true as const };
    const missingCol = extractMissingColumn(error.message);
    if (!missingCol) return { ok: false as const, message: error.message };
    if (REQUIRED_COLUMNS.has(missingCol)) return { ok: false as const, message: error.message };
    if (!(missingCol in row)) return { ok: false as const, message: error.message };
    const next = { ...row };
    delete next[missingCol];
    row = next;
  }
  return { ok: false as const, message: "Could not insert order after several retries." };
}

/** Idempotent: creates final order exactly once from checkout intent payload. */
export async function materializePaidOrderFromIntent(admin: AdminClient, reference: string) {
  const { data: existing } = await admin
    .from("orders")
    .select("id")
    .eq("order_number", reference)
    .maybeSingle();
  if (existing?.id) {
    await admin
      .from("orders")
      .update({ payment_status: "PAID", status: "CONFIRMED", payment_method: "paystack" })
      .eq("order_number", reference);
    await admin
      .from("checkout_payment_intents")
      .update({ status: "PAID", converted_at: new Date().toISOString() })
      .eq("reference", reference);
    return { ok: true as const };
  }

  const { data: intent, error: intentErr } = await admin
    .from("checkout_payment_intents")
    .select("payload, status")
    .eq("reference", reference)
    .maybeSingle();
  if (intentErr || !intent?.payload) {
    return { ok: false as const, message: "Payment intent not found for this reference." };
  }

  const payload = intent.payload as CheckoutIntentPayload;
  const insertRow: Record<string, unknown> = {
    order_number: payload.order_number,
    customer_name: payload.customer_name?.trim() ?? "",
    customer_phone: payload.customer_phone?.trim() ?? "",
    customer_email: payload.customer_email?.trim() || null,
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "paystack",
    source: "WEBSITE",
    fulfillment_type: payload.fulfillment_type,
    items: payload.items ?? [],
    subtotal: Number(payload.subtotal ?? 0),
    delivery_fee: Number(payload.delivery_fee ?? 0),
    discount_amount: 0,
    total: Number(payload.total ?? 0),
    currency: (payload.currency || "GHS").toUpperCase(),
    delivery_address: payload.delivery_address?.trim() || null,
    delivery_zone: payload.delivery_zone?.trim() || null,
    scheduled_date: payload.scheduled_date || null,
    scheduled_slot: payload.scheduled_slot || null,
    is_gift_order: Boolean(payload.is_gift_order),
    gift_message: payload.gift_message?.trim() || null,
    relationship: payload.relationship?.trim() || null,
  };
  const insertResult = await insertOrderResilient(admin, insertRow);
  if (!insertResult.ok) return insertResult;

  await admin
    .from("checkout_payment_intents")
    .update({ status: "PAID", converted_at: new Date().toISOString() })
    .eq("reference", reference);
  return { ok: true as const };
}
