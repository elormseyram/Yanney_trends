import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { initializePaystackPayment } from "@/lib/paystack";

type Payload = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
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
  mobile_network?: "MTN" | "TELECEL" | "AIRTELTIGO" | null;
  customer_order_notes?: string | null;
  gift_delivery_notes?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_city?: string | null;
  recipient_address?: string | null;
  user_id?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    if (!body.order_number || !body.customer_name || !body.customer_phone || !body.customer_email || !Array.isArray(body.items)) {
      return NextResponse.json({ ok: false, message: "Missing required order fields." }, { status: 400 });
    }

    // Read authenticated user from session cookie (set after OTP verification)
    const supabase = await createClient();
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    const userId = sessionUser?.id ?? body.user_id ?? null;

    const admin = createAdminClient();
    const customerEmail = body.customer_email.trim();
    const total = Number(body.total ?? 0);
    const subtotal = Number(body.subtotal ?? 0);
    const deliveryFee = Number(body.delivery_fee ?? 0);
    const currency = (body.currency || "GHS").toUpperCase();

    const { error: intentErr } = await admin.from("checkout_payment_intents").upsert(
      {
        reference: body.order_number,
        amount_pesewas: Math.round(total * 100),
        currency,
        customer_email: customerEmail,
        status: "INITIATED",
        payload: {
          order_number: body.order_number,
          customer_name: body.customer_name.trim(),
          customer_phone: body.customer_phone.trim(),
          customer_email: customerEmail,
          fulfillment_type: body.fulfillment_type,
          items: body.items,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          currency,
          delivery_address: body.delivery_address?.trim() || null,
          delivery_zone: body.delivery_zone?.trim() || null,
          scheduled_date: body.scheduled_date || null,
          scheduled_slot: body.scheduled_slot || null,
          is_gift_order: Boolean(body.is_gift_order),
          gift_message: body.gift_message?.trim() || null,
          relationship: body.relationship?.trim() || null,
          customer_order_notes: body.customer_order_notes?.trim() || null,
          gift_delivery_notes: body.gift_delivery_notes?.trim() || null,
          recipient_name: body.recipient_name?.trim() || null,
          recipient_phone: body.recipient_phone?.trim() || null,
          recipient_city: body.recipient_city?.trim() || null,
          recipient_address: body.recipient_address?.trim() || null,
          user_id: userId,
        },
      },
      { onConflict: "reference" },
    );
    if (intentErr) {
      // eslint-disable-next-line no-console
      console.error("[checkout_payment_intents.upsert] failed:", intentErr.message);
      const debug = process.env.NODE_ENV !== "production";
      return NextResponse.json(
        {
          ok: false,
          message: debug
            ? `[dev] Could not create payment intent: ${intentErr.message}`
            : "We couldn't start this payment. Please try again in a moment.",
        },
        { status: 500 },
      );
    }

    /* Prefer NEXT_PUBLIC_APP_URL so Paystack can reach your server from the phone
     * (LAN IP, ngrok, or production URL). Otherwise use the request Origin. */
    const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") || "";
    const headerOrigin = req.headers.get("origin")?.trim() || "";
    const fallbackOrigin = new URL(req.url).origin;
    const callbackOrigin = envBase || headerOrigin || fallbackOrigin;
    const callback_url = `${callbackOrigin}/api/paystack/verify?reference=${encodeURIComponent(body.order_number)}`;

    /* Bias the Paystack hosted page toward Mobile Money so the customer
     * lands on the right tab without an extra click. */
    const channels: string[] = ["mobile_money", "card"];

    const init = await initializePaystackPayment({
      email: customerEmail,
      amount: Math.round(total * 100),
      reference: body.order_number,
      callback_url,
      channels,
      metadata: {
        order_number: body.order_number,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        mobile_network: body.mobile_network ?? null,
      },
    });

    if (!init.status || !init.data?.authorization_url) {
      const debug = process.env.NODE_ENV !== "production";
      // eslint-disable-next-line no-console
      console.error("[paystack.initialize] non-success:", init);
      return NextResponse.json(
        {
          ok: false,
          message: debug
            ? `[dev] Paystack: ${init.message ?? "no authorization_url returned"}`
            : "We couldn't start the secure pay screen. Please try again.",
        },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, authorization_url: init.data.authorization_url });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[paystack.initialize] error:", e);
    const debug = process.env.NODE_ENV !== "production";
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        message: debug
          ? `[dev] ${detail}`
          : "Something went wrong while starting payment. Please try again.",
      },
      { status: 500 },
    );
  }
}
