"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { CatalogProduct } from "@/types/product";

interface FavoritesViewProps {
  catalog: CatalogProduct[];
}

export function FavoritesView({ catalog }: FavoritesViewProps) {
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);

  const handleClearWishlist = () => {
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      // Remove all items by toggling them off
      wishlistIds.forEach((id) => toggle(id));
    }
  };

  const favoriteProducts = useMemo(() => {
    return wishlistIds
      .map((id) => catalog.find((p) => p.id === id))
      .filter((p): p is CatalogProduct => Boolean(p));
  }, [wishlistIds, catalog]);

  return (
    <div className="min-h-screen bg-brand-surface pb-20 pt-24 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="font-bebas text-xs tracking-[0.35em] text-brand-pink">
            CURATED BY YOU
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-playfair text-3xl text-brand-text md:text-5xl">
                Your Wishlist
              </h1>
              <p className="mt-4 max-w-xl font-jost text-sm text-brand-muted">
                The pieces you have saved for later. Ready to make them yours❤️?
              </p>
            </div>
            {favoriteProducts.length > 0 ? (
              <button
                onClick={handleClearWishlist}
                className="shrink-0 rounded-lg border border-[var(--border-pink)] bg-transparent px-5 py-2 font-jost text-sm font-medium text-brand-muted transition-colors hover:border-brand-pink hover:text-brand-pink"
              >
                Clear Wishlist
              </button>
            ) : null}
          </div>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-pink)] bg-[var(--surface-card-soft)] py-24 text-center shadow-sm">
            <div className="mb-4 text-4xl text-brand-pink opacity-80">♡</div>
            <h2 className="font-playfair text-xl text-brand-text">
              No favorites yet
            </h2>
            <p className="mt-2 max-w-md font-jost text-sm text-brand-dimmed">
              Explore our collections and tap the heart icon to save the styles
              you love.
            </p>
            <Link
              href="/shop"
              className="mt-8 rounded-lg bg-brand-pink px-8 py-3 font-jost text-sm font-semibold text-black transition-transform hover:scale-105"
            >
              Shop the Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {favoriteProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}