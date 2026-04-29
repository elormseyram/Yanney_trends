import type { CatalogProduct } from "@/types/product";

export interface QuizAnswers {
  occasion: string | null;
  mood: string | null;
  fit: string | null;
  colors: string[];
  budget_max: number;
}

export function scoreProduct(product: CatalogProduct, quiz: QuizAnswers): number {
  let score = 0;

  if (quiz.occasion && product.occasion_tags.includes(quiz.occasion)) score += 30;
  if (quiz.mood && product.mood_tags.includes(quiz.mood)) score += 25;
  if (quiz.fit && product.tags.some((t) => t.toLowerCase().includes(quiz.fit!.toLowerCase())))
    score += 20;

  quiz.colors.forEach((color) => {
    if (product.tags.some((t) => t.toLowerCase().includes(color.toLowerCase()))) score += 10;
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
