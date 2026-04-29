"use client";

import Image from "next/image";
import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { findProductInCatalog } from "@/lib/catalog";
import type { CatalogProduct } from "@/types/product";

export function RecentlyViewed({
  currentSlug,
  catalog,
}: {
  currentSlug: string;
  catalog: CatalogProduct[];
}) {
  const slugs = useRecentlyViewedStore((s) => s.slugs).filter((s) => s !== currentSlug);
  const products = slugs
    .map((slug) => findProductInCatalog(catalog, slug))
    .filter(Boolean);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-brand-border pt-12">
      <h2 className="font-bebas text-xl tracking-wide text-brand-text">Recently viewed</h2>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {products.map((p) =>
          p ? (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="w-28 shrink-0"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-brand-elevated">
                <Image
                  src={p.images[0]?.url ?? ""}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <p className="mt-2 font-jost text-[11px] text-brand-muted line-clamp-2">{p.name}</p>
            </Link>
          ) : null,
        )}
      </div>
    </section>
  );
}
