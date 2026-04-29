"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/storefront/ProductCard";
import { DeliveryCountdownBanner } from "@/components/storefront/DeliveryCountdownBanner";
import type { CatalogProduct } from "@/types/product";
import { choice } from "@/lib/choiceStyles";
import {
  DRESS_OCCASION_CHIPS,
  matchesDressOccasion,
  parseDressOccasionParam,
} from "@/lib/dressOccasionFilters";

function IconGrid({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z" />
    </svg>
  );
}

function IconTag({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 4h7l9 9-7 7-9-9V4z" />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconPackage({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </svg>
  );
}

function IconSort({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 6h16M8 12h8M10 18h4" />
    </svg>
  );
}

const CATEGORY_CHIPS: { slug: string; label: string }[] = [
  { slug: "", label: "All" },
  { slug: "dresses", label: "Dresses" },
  { slug: "bags", label: "Bags" },
  { slug: "heels", label: "Heels" },
  { slug: "slippers", label: "Slippers" },
  { slug: "looks", label: "Looks" },
];

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export function ShopShell({
  products,
  initialCategory,
}: {
  products: CatalogProduct[];
  initialCategory?: string | null;
}) {
  const searchParams = useSearchParams();
  const chipFromUrl = searchParams.get("category") ?? initialCategory ?? "";
  const dressOccasion = parseDressOccasionParam(searchParams.get("dressOccasion"));
  const [sort, setSort] = useState<SortKey>("featured");
  const [saleOnly, setSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [colorSearch, setColorSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const filtered = useMemo(() => {
    const unitPrice = (p: CatalogProduct) => p.sale_price ?? p.price;
    let list = [...products];
    if (saleOnly) list = list.filter((p) => p.sale_price != null);
    if (inStockOnly)
      list = list.filter((p) => p.sizes.some((s) => s.stock > 0));
    const q = colorSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.colors?.some((c) => c.toLowerCase().includes(q)) ?? false,
      );
    }
    const minN = priceMin.trim() ? Number(priceMin) : null;
    const maxN = priceMax.trim() ? Number(priceMax) : null;
    if (minN != null && !Number.isNaN(minN)) {
      list = list.filter((p) => unitPrice(p) >= minN);
    }
    if (maxN != null && !Number.isNaN(maxN)) {
      list = list.filter((p) => unitPrice(p) <= maxN);
    }
    if (chipFromUrl === "dresses" && dressOccasion) {
      list = list.filter((p) => matchesDressOccasion(p, dressOccasion));
    }
    list.sort((a, b) => {
      if (sort === "price-asc") {
        return (a.sale_price ?? a.price) - (b.sale_price ?? b.price);
      }
      if (sort === "price-desc") {
        return (b.sale_price ?? b.price) - (a.sale_price ?? a.price);
      }
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.popularity_score - a.popularity_score;
    });
    return list;
  }, [
    products,
    sort,
    saleOnly,
    inStockOnly,
    colorSearch,
    priceMin,
    priceMax,
    chipFromUrl,
    dressOccasion,
  ]);

  const boutiqueHeroBg =
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80";

  return (
    <div className="min-h-screen bg-brand-surface">
      <DeliveryCountdownBanner />
      <div className="relative overflow-hidden border-b border-brand-pink/30">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${boutiqueHeroBg})` }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-brand-surface/90" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] grain-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bebas text-sm tracking-[0.35em] text-brand-pink"
          >
            BOUTIQUE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 font-playfair text-[clamp(1.85rem,5vw,3.25rem)] text-brand-text"
          >
            The collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 max-w-xl font-jost text-sm text-brand-muted"
          >
            Filter, sort, and fall in love — every piece is chosen for real life in Accra and beyond.
          </motion.p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-brand-pink/40 bg-brand-elevated p-4 sm:p-5">
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.25em] text-brand-dimmed">
                <IconGrid className="text-brand-text/50" />
                Room
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORY_CHIPS.map((c) => {
                  const on = (chipFromUrl || "") === c.slug;
                  return (
                    <Link
                      key={c.slug || "all"}
                      href={c.slug ? `/shop?category=${c.slug}` : "/shop"}
                      className={on ? `${choice.chip(true)} px-4 py-2` : `${choice.chip(false)} px-4 py-2`}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
              {chipFromUrl === "dresses" ? (
                <div className="mt-4 border-t border-brand-pink/30 pt-4">
                  <div className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.25em] text-brand-dimmed">
                    <IconTag className="text-brand-text/50" />
                    Dress style
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      href="/shop?category=dresses"
                      className={
                        dressOccasion == null
                          ? `${choice.chip(true)} px-3 py-1.5 text-xs`
                          : `${choice.chip(false)} px-3 py-1.5 text-xs`
                      }
                    >
                      All styles
                    </Link>
                    {DRESS_OCCASION_CHIPS.map((o) => {
                      const on = dressOccasion === o.slug;
                      return (
                        <Link
                          key={o.slug}
                          href={`/shop?category=dresses&dressOccasion=${o.slug}`}
                          className={
                            on
                              ? `${choice.chip(true)} px-3 py-1.5 text-xs`
                              : `${choice.chip(false)} px-3 py-1.5 text-xs`
                          }
                        >
                          {o.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto lg:min-w-[320px]">
              <div className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.25em] text-brand-dimmed">
                <IconSort className="text-brand-text/50" />
                Refine
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSaleOnly((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-lg ${choice.chip(saleOnly)}`}
                >
                  <IconTag className={saleOnly ? "text-brand-pink" : "text-brand-muted"} />
                  Sale
                </button>
                <button
                  type="button"
                  onClick={() => setInStockOnly((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-lg ${choice.chip(inStockOnly)}`}
                >
                  <IconPackage className={inStockOnly ? "text-emerald-600" : "text-brand-muted"} />
                  In stock
                </button>
              </div>
              <label className="block">
                <span className="font-jost text-[10px] uppercase tracking-[0.25em] text-brand-dimmed">
                  Type a color
                </span>
                <input
                  type="search"
                  value={colorSearch}
                  onChange={(e) => setColorSearch(e.target.value)}
                  placeholder="e.g. wine, navy, blush…"
                  className="mt-1.5 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-xs text-brand-text outline-none placeholder:text-brand-dimmed focus:border-brand-pink/40"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Min price GHS</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Min GHS"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-xs text-brand-text outline-none focus:border-brand-pink/40"
                  />
                </label>
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Max price GHS</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Max GHS"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 font-jost text-xs text-brand-text outline-none focus:border-brand-pink/40"
                  />
                </label>
              </div>
              <div className="relative">
                <label className="sr-only" htmlFor="shop-sort">
                  Sort
                </label>
                <IconSort className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-brand-dimmed" />
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="w-full appearance-none rounded-xl border border-brand-border bg-brand-bg py-3 pl-11 pr-10 font-jost text-xs text-brand-text shadow-inner outline-none transition-colors focus:border-brand-pink/40 focus:ring-2 focus:ring-brand-pink/15"
                >
                  <option value="featured">Featured first</option>
                  <option value="price-asc">Price · low to high</option>
                  <option value="price-desc">Price · high to low</option>
                  <option value="name">Name A–Z</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-dimmed" aria-hidden>
                  ▾
                </span>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          layout
          className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
        {filtered.length === 0 ? (
          <p className="mt-16 text-center font-jost text-brand-muted">No pieces match — loosen filters.</p>
        ) : null}
      </div>
    </div>
  );
}
