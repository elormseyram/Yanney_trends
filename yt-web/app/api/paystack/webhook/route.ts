import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { materializePaidOrderFromIntent } from "@/lib/payments/orderFromIntent";

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
    data?: { reference?: string; status?: string };
  };
  const reference = event.data?.reference?.trim();
  if (!reference) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  if (event.event === "charge.success" || event.data?.status === "success") {
    await materializePaidOrderFromIntent(admin, reference);
    await admin
      .from("checkout_payment_intents")
      .update({ status: "PAID", paid_at: new Date().toISOString(), paystack_reference: reference })
      .eq("reference", reference);
  }
  if (event.event === "charge.failed" || event.data?.status === "failed") {
    await admin
      .from("checkout_payment_intents")
      .update({ status: "FAILED", paystack_reference: reference })
      .eq("reference", reference);
  }

  return NextResponse.json({ ok: true });
}
