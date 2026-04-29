"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHubContext } from "@/lib/hub-auth";

function parseProductIds(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createRunwayOutfitPost(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") {
    redirect("/dashboard?err=" + encodeURIComponent("Only owners can manage runway inspo."));
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/dashboard/owner/runway-inspo?err=" + encodeURIComponent("Title is required"));

  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const hero_image_url = String(formData.get("hero_image_url") ?? "").trim() || null;
  const product_ids = parseProductIds(String(formData.get("product_ids") ?? ""));
  const bundle = Number.parseFloat(String(formData.get("bundle_price_ghs") ?? "0"));
  const bundle_price_ghs = Number.isFinite(bundle) ? bundle : 0;
  const sort_order = Math.round(Number.parseFloat(String(formData.get("sort_order") ?? "0"))) || 0;
  const is_published = formData.get("is_published") === "on";

  const supabase = await createClient();
  const { error } = await supabase.from("runway_outfit_posts").insert({
    title,
    subtitle,
    hero_image_url,
    product_ids,
    bundle_price_ghs,
    sort_order,
    is_published,
  });

  if (error) {
    redirect("/dashboard/owner/runway-inspo?err=" + encodeURIComponent(error.message));
  }
  revalidatePath("/dashboard/owner/runway-inspo");
  redirect("/dashboard/owner/runway-inspo?ok=1");
}

export async function deleteRunwayOutfitPost(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") {
    redirect("/dashboard?err=" + encodeURIComponent("Only owners can manage runway inspo."));
  }
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/dashboard/owner/runway-inspo?err=" + encodeURIComponent("Missing id"));

  const supabase = await createClient();
  const { error } = await supabase.from("runway_outfit_posts").delete().eq("id", id);
  if (error) {
    redirect("/dashboard/owner/runway-inspo?err=" + encodeURIComponent(error.message));
  }
  revalidatePath("/dashboard/owner/runway-inspo");
  redirect("/dashboard/owner/runway-inspo?ok=1");
}

export async function toggleRunwayOutfitPublish(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") {
    redirect("/dashboard?err=" + encodeURIComponent("Only owners can manage runway inspo."));
  }
  const id = String(formData.get("id") ?? "").trim();
  const next = formData.get("next") === "true";
  if (!id) redirect("/dashboard/owner/runway-inspo?err=" + encodeURIComponent("Missing id"));

  const supabase = await createClient();
  const { error } = await supabase.from("runway_outfit_posts").update({ is_published: next }).eq("id", id);
  if (error) {
    redirect("/dashboard/owner/runway-inspo?err=" + encodeURIComponent(error.message));
  }
  revalidatePath("/dashboard/owner/runway-inspo");
  redirect("/dashboard/owner/runway-inspo?ok=1");
}
