"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { useCallback, useState } from "react";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 280, damping: 28 });
  const sy = useSpring(my, { stiffness: 280, damping: 28 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width - 0.5) * 16;
      const py = ((e.clientY - r.top) / r.height - 0.5) * 16;
      mx.set(px);
      my.set(py);
    },
    [mx, my],
  );

  const onLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  const main = images[index] ?? images[0];
  if (!main) return null;

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-lg bg-brand-elevated"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <button
          type="button"
          className="absolute inset-0 z-10"
          onClick={() => setLightbox(true)}
          aria-label="Open fullscreen image"
        />
        <motion.div className="relative h-full w-full" style={{ x: sx, y: sy }}>
          <Image
            src={main.url}
            alt={main.alt || productName}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
          />
        </motion.div>
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition-shadow ${
                i === index ? "ring-brand-pink" : "ring-transparent hover:ring-brand-border"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <button
          type="button"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(false)}
          aria-label="Close lightbox"
        >
          <div className="relative h-[min(90vh,900px)] w-full max-w-3xl">
            <Image
              src={main.url}
              alt={main.alt || productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </button>
      ) : null}
    </div>
  );
}
