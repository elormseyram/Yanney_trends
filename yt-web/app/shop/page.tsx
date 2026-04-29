import { Suspense } from "react";
import { ShopShell } from "@/app/shop/shop-shell";
import { filterCatalogByCategorySlug } from "@/lib/catalog";
import { getCatalogProducts } from "@/lib/catalog.server";

export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

function ShopFallback() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="h-12 animate-pulse bg-brand-elevated" />
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="h-8 w-48 animate-pulse rounded bg-brand-elevated" />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-brand-elevated" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function ShopContent({ category }: { category?: string }) {
  const catalog = await getCatalogProducts();
  const products = category ? filterCatalogByCategorySlug(catalog, category) : catalog;

  return (
    <ShopShell
      key={category ?? "all"}
      initialCategory={category ?? null}
      products={products}
    />
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;

  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent category={category} />
    </Suspense>
  );
}
