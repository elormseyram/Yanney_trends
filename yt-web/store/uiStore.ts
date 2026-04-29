import { create } from "zustand";

export interface CartFlyPayload {
  /** Viewport coordinates for start of flight */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  imageUrl: string;
}

interface UiStore {
  giftCheckoutActive: boolean;
  setGiftCheckoutActive: (v: boolean) => void;
  cartPulse: boolean;
  setCartPulse: (v: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string, ms?: number) => void;
  clearToast: () => void;
  cartFly: CartFlyPayload | null;
  startCartFly: (payload: CartFlyPayload) => void;
  clearCartFly: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  giftCheckoutActive: false,
  setGiftCheckoutActive: (v) => set({ giftCheckoutActive: v }),
  cartPulse: false,
  setCartPulse: (v) => set({ cartPulse: v }),
  toastMessage: null,
  showToast: (msg, ms = 2800) => {
    set({ toastMessage: msg });
    window.setTimeout(() => set({ toastMessage: null }), ms);
  },
  clearToast: () => set({ toastMessage: null }),
  cartFly: null,
  startCartFly: (payload) => set({ cartFly: payload }),
  clearCartFly: () => set({ cartFly: null }),
}));
