"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHubContext } from "@/lib/hub-auth";

function num(raw: FormDataEntryValue | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseFloat(String(raw));
  return Number.isNaN(n) ? null : n;
}

export async function updateShopSettings(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") {
    redirect(
      "/dashboard?err=" + encodeURIComponent("Only owners can update shop settings."),
    );
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/settings?err=" + encodeURIComponent("Missing settings id"));

  const shop_name = String(formData.get("shop_name") ?? "").trim();
  if (!shop_name) redirect("/dashboard/settings?err=" + encodeURIComponent("Shop name is required"));

  const zone_a_name = String(formData.get("zone_a_name") ?? "").trim() || "Zone A";
  const zone_b_name = String(formData.get("zone_b_name") ?? "").trim() || "Zone B";
  const zone_c_name = String(formData.get("zone_c_name") ?? "").trim() || "Zone C";

  const payload = {
    shop_name,
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    shop_address: String(formData.get("shop_address") ?? "").trim() || null,
    whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim() || null,
    instagram_handle: String(formData.get("instagram_handle") ?? "").trim() || null,
    zone_a_name,
    zone_b_name,
    zone_c_name,
    zone_a_fee: num(formData.get("zone_a_fee")),
    zone_b_fee: num(formData.get("zone_b_fee")),
    zone_c_fee: num(formData.get("zone_c_fee")),
    shop_is_open: formData.get("shop_is_open") === "on",
    delivery_available: formData.get("delivery_available") === "on",
    pickup_available: formData.get("pickup_available") === "on",
    announcement_text: String(formData.get("announcement_text") ?? "").trim() || null,
    announcement_active: formData.get("announcement_active") === "on",
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("shop_settings").update(payload).eq("id", id);

  if (error) {
    redirect("/dashboard/settings?err=" + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?ok=1");
}
