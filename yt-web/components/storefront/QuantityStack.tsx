"use client";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";

const rotations = ["-4deg", "-2deg", "0deg", "2deg", "4deg"];

interface QuantityStackProps {
  productImageUrl: string;
  productName: string;
  quantity: number;
}

/**
 * Horizontal “closet rail”: rod + hook across the top, thumbnails fanned along the bar.
 */
export function QuantityStack({ productImageUrl, productName, quantity }: QuantityStackProps) {
  const swing = useAnimation();
  const showRod = quantity >= 2;

  useEffect(() => {
    if (quantity < 2) return;
    void swing.start({
      rotate: [0, -1.2, 1, -0.6, 0],
      transition: { duration: 0.65, ease: "easeInOut" },
    });
    // `swing` from useAnimation must not be a dependency — unstable reference reruns this effect every render.
  }, [quantity]);

  const layers = Math.min(quantity, 5);
  const extra = quantity > 5 ? quantity - 5 : 0;
  const slotWidth = 56;
  const spread = Math.min(20, 6 + layers * 4);

  return (
    <div className="relative mx-auto h-[132px] w-full max-w-[min(100%,360px)]">
      {showRod ? (
        <motion.svg
          animate={swing}
          className="absolute left-2 right-2 top-0 z-[60] h-[22px] w-[calc(100%-1rem)] text-brand-text"
          viewBox="0 0 280 22"
          fill="none"
          aria-hidden
          style={{ transformOrigin: "50% 30%" }}
        >
          <path
            d="M12 14h256"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M140 14V8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M132 8c4-6 16-6 20 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.svg>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 top-9 flex items-end justify-center">
        <AnimatePresence initial={false}>
          {Array.from({ length: layers }).map((_, i) => (
            <motion.div
              key={`${i}-${quantity}`}
              className="absolute bottom-0 overflow-hidden rounded-md bg-brand-elevated shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
              style={{
                width: slotWidth,
                height: slotWidth * 1.15,
                zIndex: 50 - i,
                left: `calc(50% + ${(i - (layers - 1) / 2) * spread}px)`,
                marginLeft: `-${slotWidth / 2}px`,
                transform: `rotate(${rotations[i] ?? "0deg"})`,
              }}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{
                duration: 0.35,
                ease: [0.25, 0.1, 0.25, 1],
                delay: i * 0.08,
              }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={productImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {extra > 0 ? (
        <span className="absolute bottom-1 right-1 z-[70] rounded border border-brand-border bg-white px-2 py-0.5 font-jost text-[10px] font-semibold text-brand-text shadow-sm">
          +{extra} more
        </span>
      ) : null}
      <span className="sr-only">{productName} quantity visual</span>
    </div>
  );
}
