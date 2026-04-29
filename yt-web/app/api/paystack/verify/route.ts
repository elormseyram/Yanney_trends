import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackPayment } from "@/lib/paystack";
import { materializePaidOrderFromIntent } from "@/lib/payments/orderFromIntent";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim() || "";
  if (!reference) {
    return NextResponse.redirect(new URL("/checkout?err=Missing%20payment%20reference", url.origin));
  }

  const result = await verifyPaystackPayment(reference);
  const admin = createAdminClient();

  const { data: intent } = await admin
    .from("checkout_payment_intents")
    .select("amount_pesewas")
    .eq("reference", reference)
    .maybeSingle();

  const expectedPesewas = intent?.amount_pesewas != null ? Math.round(Number(intent.amount_pesewas)) : null;
  const amountOk = expectedPesewas == null || result.amount === expectedPesewas;

  if (result.success && amountOk) {
    const created = await materializePaidOrderFromIntent(admin, reference);
    if (!created.ok) {
      return NextResponse.redirect(new URL(`/checkout?err=${encodeURIComponent(created.message)}`, url.origin));
    }
    await admin
      .from("checkout_payment_intents")
      .update({ status: "PAID", paid_at: new Date().toISOString(), paystack_reference: reference })
      .eq("reference", reference);
    return NextResponse.redirect(new URL(`/track/${encodeURIComponent(reference)}?paid=1`, url.origin));
  }

  await admin
    .from("checkout_payment_intents")
    .update({ status: "FAILED", paystack_reference: reference })
    .eq("reference", reference);
  return NextResponse.redirect(new URL(`/track/${encodeURIComponent(reference)}?paid=0`, url.origin));
}
