import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PurchaseHistoryState {
  purchasedProductIds: string[];
  addFromOrder: (productIds: string[]) => void;
  hasPurchased: (productId: string) => boolean;
}

export const usePurchaseHistoryStore = create<PurchaseHistoryState>()(
  persist(
    (set, get) => ({
      purchasedProductIds: [],
      addFromOrder: (productIds) =>
        set((s) => ({
          purchasedProductIds: [...new Set([...s.purchasedProductIds, ...productIds])],
        })),
      hasPurchased: (productId) => get().purchasedProductIds.includes(productId),
    }),
    { name: "yt-purchase-history" },
  ),
);
