"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHubContext } from "@/lib/hub-auth";

const BASE = "/dashboard/categories";

function fail(msg: string): never {
  redirect(`${BASE}?err=${encodeURIComponent(msg)}`);
}

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase()
    .slice(0, 40);
}

function intOr(raw: FormDataEntryValue | null, fallback: number): number {
  if (raw == null) return fallback;
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function createCategory(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const label = String(formData.get("label") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const sort_order = intOr(formData.get("sort_order"), 0);
  const is_visible = formData.get("is_visible") !== "off";

  if (!label) fail("Category name is required.");

  const slug = (rawSlug ? slugify(rawSlug) : slugify(label)) || slugify(label);
  if (!slug) fail("Could not derive a slug. Try a different name.");

  const supabase = await createClient();
  const { error } = await supabase.from("product_categories").insert({
    slug,
    label,
    description,
    image_url,
    sort_order,
    is_visible,
  });

  if (error) {
    const msg = error.message.includes("duplicate")
      ? "A category with that slug already exists."
      : error.message;
    fail(msg);
  }

  revalidatePath(BASE);
  revalidatePath("/dashboard/products");
  redirect(`${BASE}?ok=1`);
}

export async function updateCategory(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const slug = String(formData.get("slug") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const sort_order = intOr(formData.get("sort_order"), 0);
  const is_visible = formData.get("is_visible") === "on";

  if (!slug) fail("Missing category.");
  if (!label) fail("Category name is required.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_categories")
    .update({ label, description, image_url, sort_order, is_visible })
    .eq("slug", slug);

  if (error) fail(error.message);

  revalidatePath(BASE);
  revalidatePath("/dashboard/products");
  redirect(`${BASE}?ok=1`);
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") fail("Only owners can delete categories.");

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) fail("Missing category.");

  const supabase = await createClient();
  const { count, error: countErr } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category", slug);

  if (countErr) fail(countErr.message);
  if ((count ?? 0) > 0) {
    fail(
      `That category still has ${count} product${(count ?? 0) === 1 ? "" : "s"}. Move or delete them first, or just hide the category instead.`,
    );
  }

  const { error } = await supabase.from("product_categories").delete().eq("slug", slug);
  if (error) fail(error.message);

  revalidatePath(BASE);
  revalidatePath("/dashboard/products");
  redirect(`${BASE}?ok=1`);
}
