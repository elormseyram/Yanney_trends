"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

const KNOB_W = 52;
const PAD = 6;

type Props = {
  disabled?: boolean;
  onComplete: () => void;
};

/**
 * Slide-to-confirm checkout for touch devices; completes when the knob passes ~70% of the track.
 */
export function SwipeToCheckoutBar({ disabled, onComplete }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxX, setMaxX] = useState(0);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      setMaxX(Math.max(0, w - KNOB_W - PAD * 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (disabled) x.set(0);
  }, [disabled, x]);

  if (disabled) {
    return (
      <div className="rounded-xl bg-brand-pink/40 py-3.5 text-center font-jost text-sm font-semibold text-white/80">
        Add items to checkout
      </div>
    );
  }

  const finish = () => {
    onComplete();
  };

  return (
    <div ref={trackRef} className="relative h-[52px] overflow-hidden rounded-xl bg-brand-pink shadow-inner">
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center pl-14 pr-3 text-center font-jost text-[11px] font-semibold uppercase tracking-wide text-white/85"
        aria-hidden
      >
        Slide to checkout →
      </span>
      <motion.button
        type="button"
        aria-label="Slide to go to checkout"
        style={{ x, top: PAD, left: PAD, width: KNOB_W }}
        className="absolute flex h-10 cursor-grab items-center justify-center rounded-lg bg-white text-brand-pink shadow-md active:cursor-grabbing"
        drag="x"
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={{ left: 0, right: maxX }}
        onDragEnd={() => {
          const pos = x.get();
          const threshold = maxX > 0 ? maxX * 0.68 : 48;
          if (maxX > 0 && pos >= threshold) {
            finish();
            x.set(0);
          } else {
            void animate(x, 0, { type: "spring", stiffness: 480, damping: 32 });
          }
        }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 12h14" strokeLinecap="round" />
          <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>
    </div>
  );
}
