import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type RunwayOutfitPost = {
  id: string;
  title: string;
  subtitle: string | null;
  heroImageUrl: string | null;
  productIds: string[];
  bundlePriceGhs: number;
  sortOrder: number;
};

function mapRow(row: Record<string, unknown>): RunwayOutfitPost {
  const idsRaw = row.product_ids;
  const productIds: string[] = Array.isArray(idsRaw)
    ? idsRaw.map((x) => String(x).trim()).filter(Boolean)
    : [];
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? "").trim() || "Look",
    subtitle:
      typeof row.subtitle === "string" && row.subtitle.trim() ? row.subtitle.trim() : null,
    heroImageUrl:
      typeof row.hero_image_url === "string" && row.hero_image_url.trim()
        ? row.hero_image_url.trim()
        : null,
    productIds,
    bundlePriceGhs: Math.round(Number(row.bundle_price_ghs ?? 0) * 100) / 100,
    sortOrder: Math.round(Number(row.sort_order ?? 0)),
  };
}

export const getRunwayOutfitPosts = cache(async (): Promise<RunwayOutfitPost[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("runway_outfit_posts")
      .select("id, title, subtitle, hero_image_url, product_ids, bundle_price_ghs, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data?.length) return [];
    return data.map((r) => mapRow(r as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
});
