"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ColorSwatchDot } from "@/components/storefront/ColorSwatch";
import { choice } from "@/lib/choiceStyles";
import type { CatalogProduct } from "@/types/product";

const CATS: { id: string; label: string; match: (p: CatalogProduct) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "dresses", label: "Dresses", match: (p) => p.category === "DRESS" },
  { id: "bags", label: "Bags", match: (p) => p.category === "BAG" },
  { id: "heels", label: "Heels", match: (p) => p.category === "HEELS" },
  { id: "slippers", label: "Slippers", match: (p) => p.category === "SLIPPERS" },
  { id: "sets", label: "Sets & looks", match: (p) => p.category === "OUTFIT" || p.category === "TWO_PIECE_SET" },
  { id: "accessory", label: "Accessories", match: (p) => p.category === "ACCESSORY" },
];

function collectColors(products: CatalogProduct[]) {
  const s = new Set<string>();
  products.forEach((p) => p.colors?.forEach((c) => s.add(c)));
  return Array.from(s).sort();
}

export function RunwayCatalog({ products }: { products: CatalogProduct[] }) {
  const all = products;
  const palette = useMemo(() => collectColors(all), [all]);

  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [colorPick, setColorPick] = useState<string[]>([]);
  const [colorType, setColorType] = useState("");

  const filtered = useMemo(() => {
    const catFn = CATS.find((c) => c.id === cat)?.match ?? (() => true);
    let list = all.filter(catFn);
    const search = q.trim().toLowerCase();
    if (search) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          (p.cardSubtitle?.toLowerCase().includes(search) ?? false) ||
          (p.bagStyle?.toLowerCase().includes(search) ?? false) ||
          p.tags.some((t) => t.toLowerCase().includes(search)),
      );
    }
    if (colorPick.length) {
      list = list.filter((p) => p.colors?.some((c) => colorPick.includes(c)) ?? false);
    }
    const ct = colorType.trim().toLowerCase();
    if (ct) {
      list = list.filter((p) => p.colors?.some((c) => c.toLowerCase().includes(ct)) ?? false);
    }
    return list;
  }, [all, cat, q, colorPick, colorType]);

  const toggleColor = (c: string) => {
    setColorPick((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-20">
      <div className="border-b border-[var(--border-pink)] bg-[var(--surface-card-soft)] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="font-bebas text-xs tracking-[0.35em] text-brand-pink">RUNWAY</p>
          <h1 className="mt-2 font-playfair text-3xl text-brand-text">Inspiration board</h1>
          <p className="mt-2 max-w-xl font-jost text-sm text-brand-muted">
            Browse like Pinterest — search, filter by category and colour, tap any piece to shop.
          </p>
          <label className="mt-6 block max-w-xl">
            <span className="sr-only">Search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search looks, fabrics, vibes…"
              className="w-full rounded-xl border border-[var(--border-pink)] bg-[var(--surface-input)] px-4 py-3 font-jost text-sm text-brand-text placeholder:text-brand-dimmed outline-none focus:border-brand-pink/60"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={choice.chip(cat === c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          {palette.length ? (
            <div className="mt-6">
              <p className="font-jost text-[10px] uppercase tracking-[0.2em] text-brand-dimmed">Colours</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {palette.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleColor(c)}
                    className={`inline-flex items-center gap-2 ${choice.chip(colorPick.includes(c))}`}
                  >
                    <ColorSwatchDot label={c} size="sm" />
                    {c}
                  </button>
                ))}
              </div>
              <input
                value={colorType}
                onChange={(e) => setColorType(e.target.value)}
                placeholder="Or type a colour (e.g. wine)"
                className="mt-3 w-full max-w-md rounded-lg border border-[var(--border-pink)] bg-[var(--surface-input)] px-3 py-2 font-jost text-xs text-brand-text placeholder:text-brand-dimmed"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {filtered.length === 0 ? (
          <p className="text-center font-jost text-brand-muted">No pieces match — try another search.</p>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
            {filtered.map((p) => {
              const img = p.images[0]?.url ?? "";
              const price = p.sale_price ?? p.price;
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="mb-3 block break-inside-avoid rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card)] shadow-sm transition hover:border-brand-pink/60 sm:mb-4"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl">
                    <Image src={img} alt={p.name} fill className="object-cover" sizes="(max-width:640px) 50vw, 25vw" />
                  </div>
                  <div className="p-3">
                    <p className="font-jost text-[10px] uppercase tracking-wider text-brand-muted">
                      {p.category.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 font-playfair text-sm text-brand-text line-clamp-2">{p.name}</p>
                    {p.cardSubtitle?.trim() ? (
                      <p className="mt-0.5 font-jost text-[11px] leading-snug text-brand-muted line-clamp-2">
                        {p.cardSubtitle}
                      </p>
                    ) : null}
                    <p className="mt-1 font-jost text-xs text-brand-pink">GHS {price}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
