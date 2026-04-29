"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useState } from "react";
import { useUiStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";

const DURATION = 0.62;

export function CartFlyAnimation() {
  const payload = useUiStore((s) => s.cartFly);
  const clearCartFly = useUiStore((s) => s.clearCartFly);
  const openCart = useCartStore((s) => s.openCart);
  const reduceMotion = useReducedMotion();
  const [end, setEnd] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!payload || reduceMotion) {
      setEnd(null);
      return;
    }
    const anchor = document.getElementById("nav-cart-anchor");
    if (anchor) {
      const r = anchor.getBoundingClientRect();
      setEnd({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    } else {
      setEnd({ x: window.innerWidth - 48, y: 48 });
    }
  }, [payload, reduceMotion]);

  useEffect(() => {
    if (!payload || reduceMotion) {
      if (payload && reduceMotion) {
        clearCartFly();
        openCart();
      }
      return;
    }
    if (!end) return;
    const t = window.setTimeout(() => {
      clearCartFly();
      setEnd(null);
      openCart();
    }, DURATION * 1000 + 40);
    return () => clearTimeout(t);
  }, [payload, end, reduceMotion, clearCartFly, openCart]);

  if (!payload || !end) return null;

  const startX = payload.sx + payload.sw / 2;
  const startY = payload.sy + payload.sh / 2;
  const targetX = end.x;
  const targetY = end.y;

  return (
    <AnimatePresence>
      <motion.div
        key={`${payload.imageUrl}-${payload.sx}`}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-14 w-14 overflow-hidden rounded border border-brand-border bg-white shadow-none"
        initial={{
          x: startX - 28,
          y: startY - 28,
          scale: 1,
          opacity: 1,
          rotate: 0,
        }}
        animate={{
          x: targetX - 28,
          y: targetY - 28,
          scale: 0.32,
          opacity: 0.9,
          rotate: 10,
        }}
        exit={{ opacity: 0, scale: 0.15 }}
        transition={{ duration: DURATION, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <Image src={payload.imageUrl} alt="" fill className="object-cover" sizes="56px" unoptimized />
      </motion.div>
    </AnimatePresence>
  );
}
