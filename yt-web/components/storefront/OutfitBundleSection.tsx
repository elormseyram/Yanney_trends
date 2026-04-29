"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import type { CatalogProduct } from "@/types/product";
import { cartFlyFromElement } from "@/lib/cartFly";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";

interface OutfitBundleSectionProps {
  products: CatalogProduct[];
}

export function OutfitBundleSection({ products }: OutfitBundleSectionProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const showToast = useUiStore((s) => s.showToast);
  const startCartFly = useUiStore((s) => s.startCartFly);
  const bundleBtnRef = useRef<HTMLButtonElement>(null);

  if (products.length < 2) return null;

  const total = products.reduce((t, p) => t + (p.sale_price ?? p.price), 0);
  const firstImg = products[0]?.images[0]?.url ?? "";

  const addBundle = () => {
    const fly = cartFlyFromElement(bundleBtnRef.current, firstImg);
    if (fly) startCartFly(fly);
    products.forEach((p) => {
      const firstSize = p.sizes.find((s) => s.stock > 0)?.size ?? p.sizes[0]?.size;
      if (!firstSize) return;
      addItem({
        productId: p.id,
        slug: p.slug,
        name: p.name,
        imageUrl: p.images[0]?.url ?? "",
        category: p.category,
        size: firstSize,
        quantity: 1,
        unitPrice: p.sale_price ?? p.price,
      });
    });
    showToast("Outfit added to cart");
    if (!fly) openCart();
  };

  return (
    <section className="mt-16 border-t border-brand-border pt-12">
      <h2 className="font-bebas text-2xl tracking-wide text-brand-text">Styled with</h2>
      <p className="mt-2 font-jost text-sm text-brand-muted">
        Pieces that complete this look — add the full outfit in one tap.
      </p>
      <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="group w-[140px] shrink-0"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-brand-elevated">
              <Image
                src={p.images[0]?.url ?? ""}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="140px"
              />
            </div>
            <p className="mt-2 font-playfair text-sm text-brand-text line-clamp-2">{p.name}</p>
            <p className="font-jost text-xs text-brand-muted">
              GHS {p.sale_price ?? p.price}
            </p>
          </Link>
        ))}
      </div>
      <button
        ref={bundleBtnRef}
        type="button"
        onClick={addBundle}
        className="mt-6 w-full rounded-lg border border-brand-pink bg-[var(--surface-card-soft)] py-3 font-jost text-sm font-semibold text-brand-text transition-colors hover:bg-brand-pink-muted sm:w-auto sm:px-8"
      >
        Add entire outfit — GHS {total}
      </button>
    </section>
  );
}
