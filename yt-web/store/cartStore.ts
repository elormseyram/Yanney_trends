import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug?: string;
  name: string;
  imageUrl: string;
  category: string;
  size: string;
  color?: string;
  quantity: number;
  unitPrice: number;
}

function sameLine(
  i: CartItem,
  productId: string,
  size: string,
  color?: string,
): boolean {
  return (
    i.productId === productId &&
    i.size === size &&
    (i.color ?? "") === (color ?? "")
  );
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  lastAddedKey: string | null;
  lastAddedAt: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, qty: number, color?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastAddedKey: null,
      lastAddedAt: 0,
      addItem: (item) => {
        const key = `${item.productId}-${item.size}-${item.color ?? ""}`;
        set((s) => {
          const existing = s.items.find((i) => sameLine(i, item.productId, item.size, item.color));
          if (existing) {
            const updated = {
              ...existing,
              quantity: existing.quantity + item.quantity,
            };
            const rest = s.items.filter(
              (i) => !sameLine(i, item.productId, item.size, item.color),
            );
            return {
              items: [updated, ...rest],
              lastAddedKey: key,
              lastAddedAt: Date.now(),
            };
          }
          return {
            items: [item, ...s.items],
            lastAddedKey: key,
            lastAddedAt: Date.now(),
          };
        });
      },
      removeItem: (productId, size, color) =>
        set((s) => ({
          items: s.items.filter((i) => !sameLine(i, productId, size, color)),
        })),
      updateQuantity: (productId, size, qty, color) =>
        set((s) => {
          const line = s.items.find((i) => sameLine(i, productId, size, color));
          if (!line) return s;
          if (qty <= 0) {
            return {
              items: s.items.filter((i) => !sameLine(i, productId, size, color)),
            };
          }
          const updated = { ...line, quantity: qty };
          const rest = s.items.filter((i) => !sameLine(i, productId, size, color));
          return { items: [updated, ...rest] };
        }),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      getTotal: () => get().items.reduce((t, i) => t + i.unitPrice * i.quantity, 0),
      getItemCount: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: "yanney-cart" },
  ),
);
