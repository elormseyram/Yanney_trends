"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHubContext } from "@/lib/hub-auth";
import type { SupabaseClient } from "@supabase/supabase-js";

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

const CATEGORY_IMAGE_BUCKET = "product-images";

function extFromFile(file: File): string {
  const byName = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (byName && /^[a-z0-9]+$/.test(byName)) return byName;
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

async function uploadCategoryImage(
  supabase: SupabaseClient,
  categorySlug: string,
  file: File | null,
): Promise<string | null> {
  if (!file || file.size <= 0) return null;
  const ext = extFromFile(file);
  const path = `categories/${categorySlug.toLowerCase()}-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(CATEGORY_IMAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (uploadError) fail(`Image upload failed: ${uploadError.message}`);
  const { data } = supabase.storage.from(CATEGORY_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl || null;
}

export async function createCategory(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const label = String(formData.get("label") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image_url_input = String(formData.get("image_url") ?? "").trim() || null;
  const image_file = formData.get("image_file");
  const sort_order = intOr(formData.get("sort_order"), 0);
  const is_visible = formData.get("is_visible") !== "off";

  if (!label) fail("Category name is required.");

  const slug = (rawSlug ? slugify(rawSlug) : slugify(label)) || slugify(label);
  if (!slug) fail("Could not derive a slug. Try a different name.");

  const supabase = await createClient();
  const uploadedImageUrl = await uploadCategoryImage(
    supabase,
    slug,
    image_file instanceof File ? image_file : null,
  );
  const image_url = uploadedImageUrl ?? image_url_input;
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
  const image_url_input = String(formData.get("image_url") ?? "").trim() || null;
  const image_file = formData.get("image_file");
  const sort_order = intOr(formData.get("sort_order"), 0);
  const is_visible = formData.get("is_visible") === "on";

  if (!slug) fail("Missing category.");
  if (!label) fail("Category name is required.");

  const supabase = await createClient();
  const uploadedImageUrl = await uploadCategoryImage(
    supabase,
    slug,
    image_file instanceof File ? image_file : null,
  );
  const image_url = uploadedImageUrl ?? image_url_input;
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
