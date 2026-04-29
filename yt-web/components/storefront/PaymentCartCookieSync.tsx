"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

const COOKIE = "yt_payment_clear_cart";

function eraseCookie() {
  document.cookie = `${COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
}

/** Clears cart after Paystack verify sets a short-lived cookie (same browser tab). */
export function PaymentCartCookieSync() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
    if (!match?.[1]) return;
    clearCart();
    eraseCookie();
  }, [clearCart]);

  return null;
}
