import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { materializePaidOrderFromIntent } from "@/lib/payments/orderFromIntent";
import { notifyCustomer } from "@/lib/notificationService";

function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret || !signature) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    data?: { 
      reference?: string; 
      status?: string;
      amount?: number;
      customer?: { first_name?: string; phone?: string; email?: string };
      metadata?: any;
    };
  };
  const reference = event.data?.reference?.trim();
  if (!reference) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  if (event.event === "charge.success" || event.data?.status === "success") {
    const order = await materializePaidOrderFromIntent(admin, reference);
    await admin
      .from("checkout_payment_intents")
      .update({ status: "PAID", paid_at: new Date().toISOString(), paystack_reference: reference })
      .eq("reference", reference);

    // Trigger the Arkesel SMS notification
    const phone = event.data?.customer?.phone || event.data?.metadata?.phone;
    if (phone) {
      await notifyCustomer({
        order_number: reference, // Feel free to change to order?.order_number if your intent function returns it
        customer_name: event.data?.customer?.first_name || event.data?.metadata?.full_name || "Customer",
        customer_phone: phone,
        customer_email: event.data?.customer?.email,
        total: event.data?.amount ? event.data.amount / 100 : null, // Paystack amounts are in pesewas
        currency: "GHS"
      }, "CONFIRMED");
    }
  }
  if (event.event === "charge.failed" || event.data?.status === "failed") {
    await admin
      .from("checkout_payment_intents")
      .update({ status: "FAILED", paystack_reference: reference })
      .eq("reference", reference);
  }

  return NextResponse.json({ ok: true });
}
