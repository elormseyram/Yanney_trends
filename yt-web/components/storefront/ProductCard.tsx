"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { cartFlyFromElement } from "@/lib/cartFly";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { ColorSwatchDot } from "@/components/storefront/ColorSwatch";
import { choice } from "@/lib/choiceStyles";
import { productCardMetaLine } from "@/lib/productMerchLabels";
import type { CatalogProduct } from "@/types/product";

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconSpark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
      <path d="m5.6 5.6 2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" strokeLinecap="round" />
    </svg>
  );
}

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const showToast = useUiStore((s) => s.showToast);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wishlisted = useWishlistStore((s) => s.ids.includes(product.id));
  const [pulse, setPulse] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const startCartFly = useUiStore((s) => s.startCartFly);

  const img = product.images[0]?.url ?? "";
  const unit = product.sale_price ?? product.price;
  const totalStock = product.sizes.reduce((n, s) => n + s.stock, 0);
  const defaultSize = product.sizes.find((s) => s.stock > 0)?.size ?? product.sizes[0]?.size ?? "M";
  const href = `/product/${product.slug}`;

  const categoryLabel = product.category.replace(/_/g, " ");
  const metaLine = productCardMetaLine(product);

  const handleAdd = () => {
    if (totalStock <= 0) return;
    const fly = cartFlyFromElement(addBtnRef.current, img);
    if (fly) startCartFly(fly);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: img,
      category: product.category,
      size: defaultSize,
      quantity: 1,
      unitPrice: unit,
    });
    setPulse(true);
    window.setTimeout(() => setPulse(false), 800);
    showToast(`Added — ${product.name} (${defaultSize})`);
    if (!fly) openCart();
  };

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card-soft)] shadow-[0_10px_36px_rgba(255,105,160,0.08)] ${pulse ? "add-pulse" : ""}`}
    >
      <Link href={href} className="relative block h-[280px] w-full shrink-0 bg-[var(--surface-pop)] sm:h-[320px] md:h-[360px]">
        <Image
          src={img}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute left-3 top-3 z-[1] flex flex-col items-start gap-2">
          {totalStock <= 0 ? (
            <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-jost text-xs font-medium text-red-800">
              Not available
            </span>
          ) : null}
          {product.is_new ? (
            <span className={`${choice.chip(true)} uppercase tracking-wide shadow-sm`}>New</span>
          ) : null}
          {totalStock > 0 && totalStock < 10 ? (
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-jost text-xs font-medium text-amber-900">
              Low stock
            </span>
          ) : null}
          {totalStock >= 10 && !product.is_new ? (
            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-jost text-xs font-medium text-emerald-900">
              In stock
            </span>
          ) : null}
        </div>
      </Link>
      <div className="relative flex min-h-[140px] flex-1 flex-col p-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWish(product.id);
          }}
          className="absolute right-3 top-3 z-[1] flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-pink)] bg-[var(--surface-card)]/95 text-lg text-brand-pink shadow-sm hover:bg-[var(--surface-card)]"
          aria-label="Wishlist"
        >
          {wishlisted ? "♥" : "♡"}
        </button>
        <Link href={href} className="pr-12">
          <h3 className="line-clamp-2 min-h-[2.75rem] font-playfair text-base text-brand-text hover:text-brand-pink">
            {product.name}
          </h3>
          {product.cardSubtitle?.trim() ? (
            <p className="mt-1 line-clamp-2 font-jost text-xs text-brand-dimmed">
              {product.cardSubtitle}
            </p>
          ) : null}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          {product.sale_price ? (
            <>
              <span className="font-jost text-sm text-brand-dimmed line-through">
                GHS {product.price}
              </span>
              <span className="font-jost text-sm font-semibold text-brand-pink">
                GHS {product.sale_price}
              </span>
            </>
          ) : (
            <span className="font-jost text-sm font-semibold text-brand-text">GHS {product.price}</span>
          )}
        </div>
        <p className="mt-2 font-jost text-[11px] font-medium uppercase tracking-wide text-brand-muted">
          {categoryLabel}
        </p>
        <p className="mt-0.5 font-jost text-xs text-brand-dimmed">{metaLine}</p>
        {product.colors && product.colors.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Available colours">
            {product.colors.slice(0, 8).map((c) => (
              <ColorSwatchDot key={c} label={c} size="md" />
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <button
            ref={addBtnRef}
            type="button"
            onClick={handleAdd}
            disabled={totalStock <= 0}
            className={`${choice.cta} disabled:opacity-40 px-4 py-2 text-xs`}
          >
            Add to bag
          </button>
          <Link
            href={href}
            className="inline-flex items-center gap-1 font-jost text-xs text-brand-muted underline-offset-4 hover:text-brand-pink hover:underline"
          >
            <IconEye className="h-3.5 w-3.5 shrink-0 opacity-80" />
            View
          </Link>
          <Link
            href="/stylist"
            className="inline-flex items-center gap-1 font-jost text-xs text-brand-muted underline-offset-4 hover:text-brand-pink hover:underline"
          >
            <IconSpark className="h-3.5 w-3.5 shrink-0 opacity-80" />
            Style assist
          </Link>
        </div>
      </div>
    </article>
  );
}
