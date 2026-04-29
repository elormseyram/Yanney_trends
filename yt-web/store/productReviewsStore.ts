import { create } from "zustand";
import { persist } from "zustand/middleware";
import { usePurchaseHistoryStore } from "@/store/purchaseHistoryStore";

export interface ProductReviewEntry {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: number;
}

/** Stable empty list for selectors — never use `?? []` in Zustand hooks (breaks getServerSnapshot caching in React 19). */
export const EMPTY_PRODUCT_REVIEWS: ProductReviewEntry[] = [];

interface ProductReviewsState {
  reviewsByProduct: Record<string, ProductReviewEntry[]>;
  reviewedProductIds: string[];
  addReview: (input: {
    productId: string;
    rating: number;
    comment: string;
  }) => { ok: true } | { ok: false; reason: "not_purchased" | "already_reviewed" };
  getReviews: (productId: string) => ProductReviewEntry[];
  hasReviewed: (productId: string) => boolean;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useProductReviewsStore = create<ProductReviewsState>()(
  persist(
    (set, get) => ({
      reviewsByProduct: {},
      reviewedProductIds: [],
      hasReviewed: (productId) => get().reviewedProductIds.includes(productId),
      getReviews: (productId) =>
        get().reviewsByProduct[productId] ?? EMPTY_PRODUCT_REVIEWS,
      addReview: ({ productId, rating, comment }) => {
        if (!usePurchaseHistoryStore.getState().hasPurchased(productId)) {
          return { ok: false, reason: "not_purchased" };
        }
        if (get().reviewedProductIds.includes(productId)) {
          return { ok: false, reason: "already_reviewed" };
        }
        const entry: ProductReviewEntry = {
          id: genId(),
          productId,
          rating: Math.min(5, Math.max(1, Math.round(rating))),
          comment: comment.trim(),
          createdAt: Date.now(),
        };
        set((s) => ({
          reviewedProductIds: [...s.reviewedProductIds, productId],
          reviewsByProduct: {
            ...s.reviewsByProduct,
            [productId]: [...(s.reviewsByProduct[productId] ?? []), entry],
          },
        }));
        return { ok: true };
      },
    }),
    { name: "yt-product-reviews" },
  ),
);
