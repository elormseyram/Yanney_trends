"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHubContext } from "@/lib/hub-auth";
import { parseColorList, optionalPositiveInt } from "@/lib/hub/product-form";
import type { SupabaseClient } from "@supabase/supabase-js";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function isValidCategory(supabase: SupabaseClient, slug: string): Promise<boolean> {
  if (!slug) return false;
  const { data, error } = await supabase
    .from("product_categories")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

function parseJsonField(
  raw: string,
  label: string,
  redirectOnError: (msg: string) => never,
): unknown {
  const t = raw.trim();
  if (!t) return [];
  try {
    return JSON.parse(t);
  } catch {
    redirectOnError(`${label} could not be read. Use the table below and try again.`);
  }
}

export async function createProduct(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const card_subtitle = String(formData.get("card_subtitle") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const fabric_care = String(formData.get("fabric_care") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "");
  const dress_occasion = String(formData.get("dress_occasion") ?? "").trim() || null;
  const bag_style = String(formData.get("bag_style") ?? "").trim() || null;
  const colors = parseColorList(String(formData.get("colors") ?? ""));
  const priceRaw = String(formData.get("price") ?? "");
  const saleRaw = String(formData.get("sale_price") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const isFeatured = formData.get("is_featured") === "on";
  const total_stock_units = optionalPositiveInt(String(formData.get("total_stock_units") ?? ""));

  const price = Number.parseFloat(priceRaw);
  if (!name || !category || Number.isNaN(price) || price < 0) {
    redirect(
      "/dashboard/products/new?err=" + encodeURIComponent("Name, category, and valid price are required."),
    );
  }

  if (!slug) slug = slugify(name);
  if (!slug) {
    redirect("/dashboard/products/new?err=" + encodeURIComponent("Could not derive slug from name."));
  }

  const sale_price = saleRaw === "" ? null : Number.parseFloat(saleRaw);
  if (sale_price !== null && (Number.isNaN(sale_price) || sale_price < 0)) {
    redirect("/dashboard/products/new?err=" + encodeURIComponent("Invalid sale price."));
  }

  const sizesRaw = String(formData.get("sizes_json") ?? "").trim();
  const imagesRaw = String(formData.get("images_json") ?? "").trim();
  const sizes = parseJsonField(sizesRaw || "[]", "Sizes", (msg) =>
    redirect("/dashboard/products/new?err=" + encodeURIComponent(msg)),
  ) as unknown;
  const images = parseJsonField(imagesRaw || "[]", "Images", (msg) =>
    redirect("/dashboard/products/new?err=" + encodeURIComponent(msg)),
  ) as unknown;

  const supabase = await createClient();
  if (!(await isValidCategory(supabase, category))) {
    redirect(
      "/dashboard/products/new?err=" +
        encodeURIComponent("Pick a category from the list. Owners can add new ones on the Categories page."),
    );
  }
  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      card_subtitle,
      description,
      fabric_care,
      category,
      dress_occasion,
      bag_style,
      colors,
      total_stock_units,
      price,
      sale_price,
      sizes,
      images,
      is_published: isPublished,
      is_featured: isFeatured,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    redirect(
      "/dashboard/products/new?err=" +
        encodeURIComponent(
          error?.message ?? "Could not save this product. Check the form and try again, or ask whoever runs the site.",
        ),
    );
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  redirect(`/dashboard/products/${data.id}/edit?ok=created`);
}

export async function updateProduct(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const card_subtitle = String(formData.get("card_subtitle") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const fabric_care = String(formData.get("fabric_care") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "");
  const dress_occasion = String(formData.get("dress_occasion") ?? "").trim() || null;
  const bag_style = String(formData.get("bag_style") ?? "").trim() || null;
  const colors = parseColorList(String(formData.get("colors") ?? ""));
  const priceRaw = String(formData.get("price") ?? "");
  const saleRaw = String(formData.get("sale_price") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const isFeatured = formData.get("is_featured") === "on";
  const total_stock_units = optionalPositiveInt(String(formData.get("total_stock_units") ?? ""));

  const price = Number.parseFloat(priceRaw);
  if (!id || !name || !category || Number.isNaN(price) || price < 0) {
    redirect(`/dashboard/products/${id}/edit?err=` + encodeURIComponent("Invalid product fields."));
  }

  if (!slug) slug = slugify(name);

  const sale_price = saleRaw === "" ? null : Number.parseFloat(saleRaw);
  if (sale_price !== null && (Number.isNaN(sale_price) || sale_price < 0)) {
    redirect(`/dashboard/products/${id}/edit?err=` + encodeURIComponent("Invalid sale price."));
  }

  const sizesRaw = String(formData.get("sizes_json") ?? "").trim();
  const imagesRaw = String(formData.get("images_json") ?? "").trim();
  let sizes: unknown = undefined;
  let images: unknown = undefined;
  if (sizesRaw) {
    try {
      sizes = JSON.parse(sizesRaw);
    } catch {
      redirect(
        `/dashboard/products/${id}/edit?err=` +
          encodeURIComponent("Sizes could not be read. Add each size in the table and try again."),
      );
    }
  }
  if (imagesRaw) {
    try {
      images = JSON.parse(imagesRaw);
    } catch {
      redirect(
        `/dashboard/products/${id}/edit?err=` + encodeURIComponent("Photos could not be read. Use the photo rows and try again."),
      );
    }
  }

  const supabase = await createClient();
  if (!(await isValidCategory(supabase, category))) {
    redirect(
      `/dashboard/products/${id}/edit?err=` +
        encodeURIComponent("Pick a category from the list. Owners can add new ones on the Categories page."),
    );
  }
  const updatePayload: Record<string, unknown> = {
    name,
    slug,
    card_subtitle,
    description,
    fabric_care,
    category,
    dress_occasion,
    bag_style,
    colors,
    total_stock_units,
    price,
    sale_price,
    is_published: isPublished,
    is_featured: isFeatured,
  };
  if (sizes !== undefined) updatePayload.sizes = sizes;
  if (images !== undefined) updatePayload.images = images;

  const { error } = await supabase.from("products").update(updatePayload).eq("id", id);

  if (error) {
    redirect(`/dashboard/products/${id}/edit?err=` + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${id}/edit`);
  revalidatePath("/dashboard");
  redirect(`/dashboard/products/${id}/edit?ok=1`);
}
