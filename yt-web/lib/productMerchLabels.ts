import type { CatalogProduct } from "@/types/product";

export function labelDressOccasion(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const u = raw.trim().toUpperCase();
  const map: Record<string, string> = {
    CASUAL: "Casual",
    DINNER: "Dinner wear",
    EVENING: "Evening wear",
    BOTH: "Casual & evening",
  };
  return map[u] ?? raw.trim();
}

/** One line for cards: bag style, dress occasion, or fallback “best for” line from tags */
export function productCardMetaLine(product: CatalogProduct): string {
  if (product.category === "BAG" && product.bagStyle?.trim()) {
    return product.bagStyle.trim();
  }
  const dress = labelDressOccasion(product.dressOccasion);
  if (product.category === "DRESS" && dress) {
    return dress;
  }
  const occasionLabel =
    product.occasion_tags[0] ?? product.mood_tags[0] ?? "Every occasion";
  return `Best for · ${occasionLabel}`;
}
