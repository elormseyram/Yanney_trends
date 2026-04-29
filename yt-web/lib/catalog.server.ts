import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CatalogProduct, ProductImage, ProductSize } from "@/types/product";
import { SEED_CATALOG } from "@/lib/catalog";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop";

function num(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean);
}

function parseSizes(raw: unknown): ProductSize[] {
  if (!Array.isArray(raw)) return [{ size: "ONE", stock: 0 }];
  const out: ProductSize[] = [];
  for (const row of raw) {
    if (row && typeof row === "object" && "size" in row) {
      const o = row as { size: unknown; stock?: unknown };
      out.push({
        size: String(o.size),
        stock: num(o.stock, 0),
      });
    }
  }
  return out.length ? out : [{ size: "ONE", stock: 0 }];
}

function parseImages(raw: unknown): ProductImage[] {
  if (!Array.isArray(raw)) {
    return [{ url: PLACEHOLDER_IMAGE, alt: "Product", isPrimary: true }];
  }
  const out: ProductImage[] = [];
  for (const row of raw) {
    if (row && typeof row === "object" && "url" in row) {
      const r = row as { url: unknown; alt?: unknown; isPrimary?: unknown };
      const url = String(r.url ?? "").trim();
      if (!url) continue;
      out.push({
        url,
        alt: String(r.alt ?? "Product"),
        isPrimary: Boolean(r.isPrimary),
      });
    }
  }
  if (out.length === 0) {
    return [{ url: PLACEHOLDER_IMAGE, alt: "Product", isPrimary: true }];
  }
  if (!out.some((i) => i.isPrimary)) {
    out[0] = { ...out[0], isPrimary: true };
  }
  return out;
}

function mapRow(row: Record<string, unknown>): CatalogProduct {
  const id = String(row.id ?? "");
  const slug = String(row.slug ?? "");
  const name = String(row.name ?? "Untitled");
  const description = String(row.description ?? "").trim();
  const fabricRaw = row.fabric_care;
  const fabricCare =
    typeof fabricRaw === "string" && fabricRaw.trim() ? fabricRaw.trim() : undefined;
  const colors = asStrArray(row.colors);
  const dressRaw = row.dress_occasion;
  const dressOccasion =
    dressRaw == null || dressRaw === "" ? null : String(dressRaw).trim() || null;
  const bagRaw = row.bag_style;
  const bagStyle = bagRaw == null || bagRaw === "" ? null : String(bagRaw).trim() || null;
  const cardRaw = row.card_subtitle;
  const cardSubtitle =
    cardRaw == null || cardRaw === "" ? null : String(cardRaw).trim() || null;

  const pairing_ids = asStrArray(row.pairing_ids);
  const outfitRaw = row.outfit_group_id;
  const outfit_group_id =
    outfitRaw == null || outfitRaw === "" ? null : String(outfitRaw);

  const saleRaw = row.sale_price;
  const saleParsed =
    saleRaw == null || saleRaw === "" ? null : num(saleRaw, NaN);
  const sale_price =
    saleParsed != null && Number.isFinite(saleParsed) && saleParsed > 0 ? saleParsed : null;

  const sizes = parseSizes(row.sizes);
  const summedStock = sizes.reduce((n, s) => n + Math.max(0, Math.round(Number(s.stock ?? 0))), 0);
  /** Prefer sum of SKU rows so PDP/cards match hub inventory after sales (column can lag). */
  const totalStockUnits =
    sizes.length > 0
      ? summedStock
      : row.total_stock_units == null || row.total_stock_units === ""
        ? null
        : num(row.total_stock_units, -1) >= 0
          ? num(row.total_stock_units, 0)
          : null;

  return {
    id,
    slug,
    name,
    cardSubtitle,
    description,
    fabricCare,
    colors: colors.length ? colors : undefined,
    dressOccasion,
    bagStyle,
    totalStockUnits,
    category: String(row.category ?? "ACCESSORY"),
    price: num(row.price, 0),
    sale_price,
    sizes,
    images: parseImages(row.images),
    tags: asStrArray(row.tags),
    mood_tags: asStrArray(row.mood_tags),
    occasion_tags: asStrArray(row.occasion_tags),
    outfit_group_id,
    pairing_ids,
    popularity_score: Math.round(num(row.popularity_score, 0)),
    is_featured: Boolean(row.is_featured),
  };
}

/**
 * Published products from the database. On fetch errors (including missing env), returns {@link SEED_CATALOG}.
 * When the query succeeds but returns no rows, returns an empty array.
 */
export const getCatalogProducts = cache(async (): Promise<CatalogProduct[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    if (!data?.length) return [];
    return data.map((r) => mapRow(r as unknown as Record<string, unknown>));
  } catch {
    return SEED_CATALOG;
  }
});
