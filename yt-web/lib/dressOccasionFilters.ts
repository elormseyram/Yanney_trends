import type { CatalogProduct } from "@/types/product";

/** URL param value for `dressOccasion` — shareable, stable slugs */
export type DressOccasionSlug = "casual" | "office" | "dinner" | "party" | "beach";

export const DRESS_OCCASION_CHIPS: { slug: DressOccasionSlug; label: string }[] = [
  { slug: "casual", label: "Casual" },
  { slug: "office", label: "Office wear" },
  { slug: "dinner", label: "Dinner wear" },
  { slug: "party", label: "Club or party wear" },
  { slug: "beach", label: "Beach wear" },
];

const SLUGS = new Set<string>(DRESS_OCCASION_CHIPS.map((c) => c.slug));

export function parseDressOccasionParam(raw: string | null): DressOccasionSlug | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  return SLUGS.has(s) ? (s as DressOccasionSlug) : null;
}

/**
 * Whether a dress matches the selected boutique “dress style” filter.
 * Uses `occasion_tags` (and lightly `tags`) — keep tags aligned in catalog / hub.
 */
function dressOccasionFromHub(
  product: CatalogProduct,
  filterSlug: DressOccasionSlug,
): boolean | null {
  const raw = product.dressOccasion?.trim().toUpperCase();
  if (!raw) return null;
  switch (filterSlug) {
    case "casual":
      return raw === "CASUAL" || raw === "BOTH";
    case "office":
      return raw === "BOTH" ? true : null;
    case "dinner":
      return raw === "DINNER" || raw === "EVENING" || raw === "BOTH";
    case "party":
      return raw === "EVENING" || raw === "BOTH";
    case "beach":
      return null;
    default:
      return null;
  }
}

export function matchesDressOccasion(
  product: CatalogProduct,
  slug: DressOccasionSlug | null,
): boolean {
  if (!slug) return true;
  if (product.category !== "DRESS") return false;

  const fromHub = dressOccasionFromHub(product, slug);
  if (fromHub != null) return fromHub;

  const occasions = product.occasion_tags.map((t) => t.toLowerCase());
  const tag = product.tags.map((t) => t.toLowerCase());

  const hasOcc = (sub: string) => occasions.some((o) => o.includes(sub));
  const hasTag = (sub: string) => tag.some((t) => t.includes(sub));

  switch (slug) {
    case "casual":
      return (
        hasOcc("casual") ||
        hasOcc("weekend") ||
        hasTag("casual") ||
        hasTag("relaxed")
      );
    case "office":
      return hasOcc("office") || hasOcc("work");
    case "dinner":
      return (
        hasOcc("date night") ||
        hasOcc("dinner") ||
        hasOcc("wedding") ||
        hasOcc("event") ||
        hasOcc("evening")
      );
    case "party":
      return hasOcc("party") || hasOcc("night out") || hasOcc("club");
    case "beach":
      return (
        hasOcc("beach") ||
        hasOcc("resort") ||
        hasOcc("vacation") ||
        hasOcc("pool")
      );
    default:
      return true;
  }
}
