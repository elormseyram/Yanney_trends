"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHubContext } from "@/lib/hub-auth";
import { ALL_ORDER_STATUSES } from "@/lib/hub/constants";
import type { OrderStatus } from "@/lib/hub/types";

function isOrderStatus(s: string): s is OrderStatus {
  return (ALL_ORDER_STATUSES as string[]).includes(s);
}

function safeRedirect(raw: string, fallback: string): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  const redirectToRaw = String(formData.get("redirectTo") ?? "");
  if (!orderId || !isOrderStatus(status)) {
    redirect(orderId ? `/dashboard/orders/${orderId}?err=bad` : "/dashboard/orders?err=bad");
  }

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("order_number, customer_name, customer_phone")
    .single();

  if (error) {
    const target = redirectToRaw
      ? safeRedirect(redirectToRaw, `/dashboard/orders/${orderId}`)
      : `/dashboard/orders/${orderId}`;
    const sep = target.includes("?") ? "&" : "?";
    redirect(`${target}${sep}err=${encodeURIComponent(error.message)}`);
  }

  // Trigger the SMS notification via the Storefront API
  if (order?.customer_phone) {
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${webUrl}/api/admin/notify-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: order.order_number,
          customer_name: order.customer_name || "Customer",
          customer_phone: order.customer_phone,
          status: status,
        }),
      });
      const data = await res.json();
      console.log("[SMS Trigger] Storefront response:", data);
    } catch (err) {
      console.error("[SMS Trigger] Failed to ping storefront:", err);
    }
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard");

  const target = redirectToRaw
    ? safeRedirect(redirectToRaw, `/dashboard/orders/${orderId}`)
    : `/dashboard/orders/${orderId}`;
  const sep = target.includes("?") ? "&" : "?";
  redirect(`${target}${sep}ok=status`);
}

export async function updateOrderPaymentStatus(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const orderId = String(formData.get("orderId") ?? "");
  const paymentStatus = String(formData.get("payment_status") ?? "");
  const allowed = ["PENDING", "PAID", "FAILED", "REFUNDED"];
  if (!orderId || !allowed.includes(paymentStatus)) {
    redirect(orderId ? `/dashboard/orders/${orderId}?err=bad` : "/dashboard/orders?err=bad");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    redirect(`/dashboard/orders/${orderId}?err=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard");
  redirect(`/dashboard/orders/${orderId}?ok=payment`);
}

export async function updateOrderRider(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const orderId = String(formData.get("orderId") ?? "");
  const rawRider = String(formData.get("delivery_rider_id") ?? "").trim();
  const delivery_rider_id = rawRider === "" ? null : rawRider;

  if (!orderId) {
    redirect("/dashboard/orders?err=" + encodeURIComponent("Missing order."));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ delivery_rider_id, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    redirect(`/dashboard/orders/${orderId}?err=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/riders");
  redirect(`/dashboard/orders/${orderId}?ok=rider`);
}

const ALLOWED_SCHEDULE_STATUSES = new Set(["APPROVED", "DECLINED", "PENDING"]);

export async function updateScheduleApproval(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const orderId = String(formData.get("orderId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("decision_note") ?? "").trim() || null;

  if (!orderId) {
    redirect("/dashboard/orders?err=" + encodeURIComponent("Missing order."));
  }
  if (!ALLOWED_SCHEDULE_STATUSES.has(decision)) {
    redirect(
      `/dashboard/orders/${orderId}?err=` +
        encodeURIComponent("Pick approve or decline."),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      schedule_status: decision,
      schedule_decision_note: note,
      schedule_decided_at: decision === "PENDING" ? null : new Date().toISOString(),
      schedule_decided_by: decision === "PENDING" ? null : ctx.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    redirect(`/dashboard/orders/${orderId}?err=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  redirect(`/dashboard/orders/${orderId}?ok=schedule`);
}
