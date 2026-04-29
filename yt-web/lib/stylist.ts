import type { CatalogProduct } from "@/types/product";

export interface QuizAnswers {
  occasion: string | null;
  mood: string | null;
  fit: string | null;
  colors: string[];
  budget_max: number;
}

/** Quiz colour chip ids → tokens matched against tags + product colours. */
const COLOR_LEXICON: Record<string, string[]> = {
  neutral: ["black", "white", "beige", "cream", "ivory", "grey", "gray", "nude", "tan", "taupe", "champagne"],
  bold: ["red", "orange", "yellow", "scarlet", "crimson", "gold"],
  cool: ["blue", "green", "purple", "navy", "teal", "aqua", "indigo", "sapphire"],
  earth: ["brown", "rust", "olive", "terracotta", "camel", "khaki", "cocoa"],
  pastel: ["pink", "lilac", "mint", "lavender", "peach", "blush", "powder"],
};

function tokensForColorQuizId(id: string): string[] {
  const k = id.toLowerCase().trim();
  return COLOR_LEXICON[k] ?? [k];
}

function haystackForProduct(p: CatalogProduct): string {
  const parts = [
    ...p.tags,
    ...(p.colors ?? []),
    ...p.occasion_tags,
    ...p.mood_tags,
    p.name,
    p.description,
    p.cardSubtitle ?? "",
    p.bagStyle ?? "",
  ];
  return parts.join(" ").toLowerCase();
}

function occasionMatches(occasionLabel: string, p: CatalogProduct): boolean {
  const o = occasionLabel.toLowerCase();
  if (p.occasion_tags.some((t) => t.toLowerCase() === o)) return true;
  const blob = p.occasion_tags.join(" ").toLowerCase() + " " + haystackForProduct(p);
  if (o.includes("casual")) return /\b(casual|day|brunch|weekend|street)\b/.test(blob);
  if (o.includes("party") || o.includes("night out"))
    return /\b(party|night|club|cocktail|evening|glam)\b/.test(blob);
  if (o.includes("wedding") || o.includes("event"))
    return /\b(wedding|bridal|gala|formal|ceremony|event)\b/.test(blob);
  if (o.includes("work") || o.includes("office"))
    return /\b(work|office|corporate|business|tailored)\b/.test(blob);
  if (o.includes("date")) return /\b(date|romantic|dinner)\b/.test(blob);
  if (o.includes("photoshoot") || o.includes("photo"))
    return /\b(photo|editorial|statement|runway)\b/.test(blob);
  return p.occasion_tags.some((t) => o.includes(t.toLowerCase()) || t.toLowerCase().includes(o));
}

function moodMatches(moodLabel: string, p: CatalogProduct): boolean {
  const m = moodLabel.toLowerCase();
  if (p.mood_tags.some((t) => t.toLowerCase() === m)) return true;
  const blob = p.mood_tags.join(" ").toLowerCase() + " " + haystackForProduct(p);
  if (m.includes("elegant") || m.includes("refined")) return /\b(elegant|refined|classic|timeless)\b/.test(blob);
  if (m.includes("bold") || m.includes("daring")) return /\b(bold|daring|edgy|statement)\b/.test(blob);
  if (m.includes("minimal")) return /\b(minimal|clean|simple|pared)\b/.test(blob);
  if (m.includes("cute") || m.includes("feminine")) return /\b(cute|feminine|sweet|playful)\b/.test(blob);
  if (m.includes("luxurious") || m.includes("rich")) return /\b(lux|rich|luxe|opulent|velvet)\b/.test(blob);
  return p.mood_tags.some((t) => m.includes(t.toLowerCase()) || t.toLowerCase().includes(m));
}

export function scoreProduct(product: CatalogProduct, quiz: QuizAnswers): number {
  let score = 0;

  if (quiz.occasion) {
    if (product.occasion_tags.includes(quiz.occasion)) score += 34;
    else if (occasionMatches(quiz.occasion, product)) score += 26;
  }
  if (quiz.mood) {
    if (product.mood_tags.includes(quiz.mood)) score += 28;
    else if (moodMatches(quiz.mood, product)) score += 20;
  }
  if (quiz.fit) {
    const f = quiz.fit.toLowerCase();
    if (product.tags.some((t) => t.toLowerCase().includes(f))) score += 22;
    else if (haystackForProduct(product).includes(f)) score += 12;
  }

  const hay = haystackForProduct(product);
  quiz.colors.forEach((colorId) => {
    const tokens = tokensForColorQuizId(colorId);
    let hit = false;
    for (const tok of tokens) {
      if (tok && hay.includes(tok.toLowerCase())) {
        hit = true;
        break;
      }
    }
    if (hit) score += 12;
  });

  const price = product.sale_price ?? product.price;
  if (price > quiz.budget_max) return -999;

  score += Math.min(product.popularity_score / 10, 5);

  return score;
}

export function rankProductsForQuiz(
  products: CatalogProduct[],
  quiz: QuizAnswers,
  limit = 12,
): CatalogProduct[] {
  return products
    .map((p) => ({ p, s: scoreProduct(p, quiz) }))
    .filter((x) => x.s > -500)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}

export function groupByOutfitGroup(products: CatalogProduct[]): Map<string, CatalogProduct[]> {
  const m = new Map<string, CatalogProduct[]>();
  products.forEach((p) => {
    if (!p.outfit_group_id) return;
    const list = m.get(p.outfit_group_id) ?? [];
    list.push(p);
    m.set(p.outfit_group_id, list);
  });
  return m;
}
