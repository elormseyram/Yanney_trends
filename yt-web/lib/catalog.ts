import type { CatalogProduct } from "@/types/product";

/** Demo catalog when the database is unreachable or misconfigured */
export const SEED_CATALOG: CatalogProduct[] = [
  {
    id: "p1",
    slug: "editorial-midi-dress",
    sku: "YT-EDM-001",
    name: "Editorial Midi Dress",
    description:
      "Sculpted midi in a fluid weave — structured shoulders, soft drape through the hem. Designed for events where the room should notice you before you speak.",
    colors: ["Black", "Ivory", "Wine"],
    fabricCare:
      "Shell: premium polyester blend with satin lining (100% polyester). Lining: breathable cupro blend.\n\nWashing: machine wash cold (30°C max) on a gentle or delicate cycle. Turn the garment inside out before washing to protect surface texture and any applied details. Use a mild detergent — avoid bleach, fabric softener on delicate fibres, and never pour detergent directly onto the fabric.\n\nDrying: do not tumble dry. Reshape while damp and air dry flat on a clean towel away from direct sunlight to prevent colour fade.\n\nIroning: cool iron on reverse only; use a pressing cloth if needed. Do not iron over trims or heat-sensitive areas.\n\nStorage: hang on a padded hanger or fold with tissue between layers for travel. Professional dry clean is recommended for deep stains or before long storage.",
    category: "DRESS",
    price: 520,
    sale_price: 420,
    sizes: [
      { size: "S", stock: 12 },
      { size: "M", stock: 8 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 0 },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&h=1200&fit=crop",
        alt: "Editorial Midi Dress",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1515372039744-b8f02a815cd7?w=900&h=1200&fit=crop",
        alt: "Dress detail",
      },
      {
        url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1200&fit=crop",
        alt: "Dress movement",
      },
    ],
    tags: ["fitted", "evening", "elegant"],
    mood_tags: ["Elegant & Refined", "Luxurious & Rich"],
    occasion_tags: ["Wedding / Event", "Date Night", "Party / Night Out", "Evening"],
    outfit_group_id: "outfit-1",
    pairing_ids: ["p5", "p7"],
    popularity_score: 72,
    is_featured: true,
    is_new: true,
  },
  {
    id: "p2",
    slug: "minimal-shift-dress",
    sku: "YT-MSD-002",
    name: "Minimal Shift Dress",
    description:
      "Clean lines, invisible pockets, and a weight that moves with Accra heat. Your everyday power piece.",
    category: "DRESS",
    colors: ["Navy", "Stone", "Blush"],
    price: 310,
    sale_price: null,
    sizes: [
      { size: "S", stock: 6 },
      { size: "M", stock: 15 },
      { size: "L", stock: 9 },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&h=1200&fit=crop",
        alt: "Minimal Shift Dress",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aa0b?w=900&h=1200&fit=crop",
        alt: "Shift dress",
      },
    ],
    tags: ["relaxed", "minimal", "work"],
    mood_tags: ["Minimal & Clean"],
    occasion_tags: ["Work / Office", "Casual Day Out"],
    outfit_group_id: null,
    pairing_ids: ["p5"],
    popularity_score: 45,
    is_featured: true,
  },
  {
    id: "p3",
    slug: "structured-blazer-set",
    name: "Structured Blazer Set",
    description: "Two-piece set: sharp blazer and tailored shorts. Boardroom to rooftop.",
    category: "OUTFIT",
    colors: ["Black", "Camel", "Ivory"],
    price: 680,
    sale_price: null,
    sizes: [
      { size: "S", stock: 3 },
      { size: "M", stock: 5 },
      { size: "L", stock: 2 },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&h=1200&fit=crop",
        alt: "Blazer set",
        isPrimary: true,
      },
    ],
    tags: ["fitted", "work", "bold"],
    mood_tags: ["Bold & Daring", "Luxurious & Rich"],
    occasion_tags: ["Work / Office", "Party / Night Out"],
    outfit_group_id: "outfit-2",
    pairing_ids: ["p7"],
    popularity_score: 88,
    is_featured: true,
  },
  {
    id: "p4",
    slug: "woven-clutch-onyx",
    name: "Woven Clutch — Onyx",
    description: "Hand-finished weave, magnetic closure, interior card sleeve.",
    category: "BAG",
    colors: ["Black", "Gold", "Chocolate"],
    price: 185,
    sale_price: null,
    sizes: [{ size: "ONE", stock: 22 }],
    images: [
      {
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&h=1200&fit=crop",
        alt: "Clutch bag",
        isPrimary: true,
      },
    ],
    tags: ["minimal", "evening"],
    mood_tags: ["Elegant & Refined", "Minimal & Clean"],
    occasion_tags: ["Wedding / Event", "Date Night"],
    outfit_group_id: "outfit-1",
    pairing_ids: ["p1"],
    popularity_score: 34,
    is_featured: true,
  },
  {
    id: "p5",
    slug: "mini-chain-bag",
    name: "Mini Chain Bag",
    description: "Quilted mini with light gold chain — carries phone, keys, and confidence.",
    category: "BAG",
    colors: ["Black", "Blush", "Ivory"],
    price: 240,
    sale_price: 210,
    sizes: [{ size: "ONE", stock: 2 }],
    images: [
      {
        url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=900&h=1200&fit=crop",
        alt: "Chain bag",
        isPrimary: true,
      },
    ],
    tags: ["bold", "evening"],
    mood_tags: ["Cute & Feminine", "Luxurious & Rich"],
    occasion_tags: ["Party / Night Out", "Date Night"],
    outfit_group_id: "outfit-1",
    pairing_ids: ["p1", "p7"],
    popularity_score: 91,
    is_featured: true,
  },
  {
    id: "p6",
    slug: "satin-mule-heels",
    name: "Satin Mule Heels",
    description: "Low vamp, padded insole, 85mm heel. Walkable glamour.",
    category: "HEELS",
    colors: ["Black", "Nude", "Rose"],
    price: 295,
    sale_price: null,
    sizes: [
      { size: "37", stock: 4 },
      { size: "38", stock: 5 },
      { size: "39", stock: 3 },
      { size: "40", stock: 1 },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&h=1200&fit=crop",
        alt: "Heels",
        isPrimary: true,
      },
    ],
    tags: ["elegant", "evening"],
    mood_tags: ["Elegant & Refined"],
    occasion_tags: ["Wedding / Event", "Party / Night Out"],
    outfit_group_id: "outfit-1",
    pairing_ids: ["p1"],
    popularity_score: 56,
    is_featured: true,
  },
  {
    id: "p7",
    slug: "embellished-evening-heel",
    name: "Embellished Evening Heel",
    description: "Crystal detail at the heel counter. For nights that deserve a spotlight.",
    category: "HEELS",
    colors: ["Gold", "Silver", "Black"],
    price: 350,
    sale_price: null,
    sizes: [
      { size: "37", stock: 0 },
      { size: "38", stock: 2 },
      { size: "39", stock: 2 },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1535040735119-a1a6a43e664f?w=900&h=1200&fit=crop",
        alt: "Evening heels",
        isPrimary: true,
      },
    ],
    tags: ["bold", "luxury"],
    mood_tags: ["Bold & Daring", "Luxurious & Rich"],
    occasion_tags: ["Wedding / Event", "Photoshoot"],
    outfit_group_id: "outfit-1",
    pairing_ids: ["p1", "p5"],
    popularity_score: 62,
    is_featured: false,
  },
  {
    id: "p8",
    slug: "braided-flat-slippers",
    name: "Braided Flat Slippers",
    description: "Soft footbed, leather braid, rubber outsole — errands elevated.",
    category: "SLIPPERS",
    colors: ["Beige", "Black", "Tan"],
    price: 120,
    sale_price: null,
    sizes: [
      { size: "36", stock: 8 },
      { size: "37", stock: 10 },
      { size: "38", stock: 7 },
      { size: "39", stock: 5 },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=900&h=1200&fit=crop",
        alt: "Slippers",
        isPrimary: true,
      },
    ],
    tags: ["relaxed", "casual"],
    mood_tags: ["Cute & Feminine", "Minimal & Clean"],
    occasion_tags: ["Casual Day Out"],
    outfit_group_id: null,
    pairing_ids: [],
    popularity_score: 28,
    is_featured: false,
  },
  {
    id: "p9",
    slug: "pearl-hair-clips-set",
    name: "Pearl Hair Clips Set",
    description: "Set of three — mix, match, stack. Instant polish.",
    category: "ACCESSORY",
    colors: ["White", "Pearl", "Gold"],
    price: 45,
    sale_price: null,
    sizes: [{ size: "ONE", stock: 40 }],
    images: [
      {
        url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&h=1200&fit=crop",
        alt: "Hair accessories",
        isPrimary: true,
      },
    ],
    tags: ["pastel", "cute"],
    mood_tags: ["Cute & Feminine"],
    occasion_tags: ["Casual Day Out", "Photoshoot"],
    outfit_group_id: null,
    pairing_ids: [],
    popularity_score: 15,
    is_featured: false,
  },
  {
    id: "p10",
    slug: "two-piece-linen-set",
    name: "Two-Piece Linen Set",
    description: "Crop top and wide-leg pant in breathable linen blend. Brunch to beach house.",
    category: "TWO_PIECE_SET",
    colors: ["Natural", "Stone", "Olive"],
    price: 445,
    sale_price: null,
    sizes: [
      { size: "S", stock: 5 },
      { size: "M", stock: 6 },
      { size: "L", stock: 4 },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=900&h=1200&fit=crop",
        alt: "Linen set",
        isPrimary: true,
      },
    ],
    tags: ["flowing", "minimal"],
    mood_tags: ["Minimal & Clean"],
    occasion_tags: ["Casual Day Out", "Date Night"],
    outfit_group_id: "outfit-3",
    pairing_ids: ["p8"],
    popularity_score: 40,
    is_featured: true,
  },
  {
    id: "p11",
    slug: "sundrenched-coverup-dress",
    sku: "YT-SCD-011",
    name: "Sundrenched Cover-Up Dress",
    description:
      "Light cotton-linen blend, deep V and side slits — throw over swim or wear to a seaside lunch.",
    colors: ["White", "Coral", "Seafoam"],
    fabricCare:
      "Machine wash cold with similar colours. Line dry in shade. Cool iron if needed.",
    category: "DRESS",
    price: 265,
    sale_price: null,
    sizes: [
      { size: "S", stock: 7 },
      { size: "M", stock: 9 },
      { size: "L", stock: 5 },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=1200&fit=crop",
        alt: "Light beach dress",
        isPrimary: true,
      },
    ],
    tags: ["flowing", "casual", "resort", "beach"],
    mood_tags: ["Minimal & Clean", "Cute & Feminine"],
    occasion_tags: ["Beach / Resort", "Casual Day Out", "Vacation / Pool"],
    outfit_group_id: null,
    pairing_ids: ["p8"],
    popularity_score: 38,
    is_featured: true,
    is_new: true,
  },
];

export function findProductInCatalog(
  catalog: CatalogProduct[],
  slug: string,
): CatalogProduct | undefined {
  return catalog.find((p) => p.slug === slug);
}

/** Prefer featured items; if none, show the newest slice so DB-only shops still have a hero. */
export function pickFeaturedProducts(catalog: CatalogProduct[], limit = 8): CatalogProduct[] {
  const featured = catalog.filter((p) => p.is_featured).slice(0, limit);
  if (featured.length > 0) return featured;
  return catalog.slice(0, limit);
}

export function getCategoryProductCount(catalog: CatalogProduct[], categorySlug: string): number {
  return filterCatalogByCategorySlug(catalog, categorySlug).length;
}

export function filterCatalogByCategorySlug(
  catalog: CatalogProduct[],
  categorySlug: string,
): CatalogProduct[] {
  const key = categorySlug.toLowerCase();
  const map: Record<string, string> = {
    dresses: "DRESS",
    bags: "BAG",
    heels: "HEELS",
    slippers: "SLIPPERS",
    looks: "OUTFIT",
    "two-piece": "TWO_PIECE_SET",
    accessory: "ACCESSORY",
  };
  const cat = map[key];
  if (!cat) return catalog;
  if (key === "looks") {
    return catalog.filter(
      (p) => p.category === "OUTFIT" || p.category === "TWO_PIECE_SET",
    );
  }
  return catalog.filter((p) => p.category === cat);
}

const SHOWCASE_CATEGORY_SLUGS = ["dresses", "bags", "heels", "slippers", "looks"] as const;

export function getCategoryShowcaseCounts(
  catalog: CatalogProduct[],
): Record<(typeof SHOWCASE_CATEGORY_SLUGS)[number], number> {
  return Object.fromEntries(
    SHOWCASE_CATEGORY_SLUGS.map((slug) => [slug, getCategoryProductCount(catalog, slug)]),
  ) as Record<(typeof SHOWCASE_CATEGORY_SLUGS)[number], number>;
}

export function getPairingProducts(
  product: CatalogProduct,
  catalog: CatalogProduct[],
): CatalogProduct[] {
  return product.pairing_ids
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is CatalogProduct => Boolean(p));
}

export function getOutfitGroupProducts(
  outfitGroupId: string,
  catalog: CatalogProduct[],
): CatalogProduct[] {
  return catalog.filter((p) => p.outfit_group_id === outfitGroupId);
}
