"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cartFlyFromElement } from "@/lib/cartFly";
import { ColorSwatchDot } from "@/components/storefront/ColorSwatch";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { MultiSizeSelector } from "@/components/storefront/MultiSizeSelector";
import { QuantityStack } from "@/components/storefront/QuantityStack";
import { AISizeHelper } from "@/components/storefront/AISizeHelper";
import { DeliveryEstimator } from "@/components/storefront/DeliveryEstimator";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { OutfitBundleSection } from "@/components/storefront/OutfitBundleSection";
import { RecentlyViewed } from "@/components/storefront/RecentlyViewed";
import { ProductReviews } from "@/components/storefront/ProductReviews";
import { ProductDropSpotlight } from "@/components/storefront/ProductDropSpotlight";
import { choice } from "@/lib/choiceStyles";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import { SHOP_WHATSAPP } from "@/lib/constants";
import { labelDressOccasion } from "@/lib/productMerchLabels";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import type { CatalogProduct } from "@/types/product";

function stockLabel(product: CatalogProduct): { tone: "ok" | "low" | "out"; text: string } {
  const total = product.sizes.reduce((n, s) => n + s.stock, 0);
  if (total <= 0) return { tone: "out", text: "Sold out" };
  if (total < 10) return { tone: "low", text: `Low stock — ${total} left` };
  return { tone: "ok", text: "In stock" };
}

export function ProductDetailView({
  product,
  catalog,
  pairingProducts,
}: {
  product: CatalogProduct;
  catalog: CatalogProduct[];
  pairingProducts: CatalogProduct[];
}) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const showToast = useUiStore((s) => s.showToast);
  const startCartFly = useUiStore((s) => s.startCartFly);
  const addToCartBtnRef = useRef<HTMLButtonElement>(null);
  const pushRecent = useRecentlyViewedStore((s) => s.push);

  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    pushRecent(product.slug);
    const first = product.sizes.find((s) => s.stock > 0)?.size ?? null;
    setSize(first);
    setSelectedColor(product.colors?.[0] ?? "");
  }, [product, pushRecent]);

  const primary = product.images[0]?.url ?? "";
  const unit = product.sale_price ?? product.price;
  const stock = stockLabel(product);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  const addToCart = () => {
    if (!size || stock.tone === "out") return;
    const line = product.sizes.find((s) => s.size === size);
    if (!line || line.stock < 1) return;
    const fly = cartFlyFromElement(addToCartBtnRef.current, primary);
    if (fly) startCartFly(fly);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: primary,
      category: product.category,
      size,
      color: selectedColor || undefined,
      quantity: Math.min(qty, line.stock),
      unitPrice: unit,
    });
    showToast(`Added — ${product.name} (${size})`);
    if (!fly) openCart();
  };

  const waLink = buildWhatsAppOrderLink(product, size ?? "M", qty, SHOP_WHATSAPP);

  const views = Math.max(3, Math.floor(product.popularity_score / 6));

  const stockBadgeClass =
    stock.tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
      : stock.tone === "low"
        ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
        : "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="font-jost text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-pink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-brand-pink">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${product.category.toLowerCase()}`} className="hover:text-brand-pink">
          {product.category.replace(/_/g, " ")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-brand-text">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-bebas text-sm tracking-[0.2em] text-brand-pink">
            {product.category.replace(/_/g, " ")}
          </p>
          <h1 className="mt-2 font-playfair text-3xl text-brand-text md:text-4xl">
            {product.name}
          </h1>
          {product.cardSubtitle?.trim() ? (
            <p className="mt-3 max-w-xl font-jost text-base leading-relaxed text-brand-muted">
              {product.cardSubtitle}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            {product.sale_price ? (
              <>
                <span className="font-jost text-lg text-brand-dimmed line-through">
                  GHS {product.price}
                </span>
                <span className="font-jost text-xl font-semibold text-brand-pink">
                  GHS {product.sale_price}
                </span>
              </>
            ) : (
              <span className="font-jost text-xl font-semibold text-brand-text">
                GHS {product.price}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg border px-4 py-2.5 font-jost text-xs font-medium ${stockBadgeClass}`}
            >
              {stock.text}
            </span>
          </div>

          <div className="mt-8">
            <ProductDropSpotlight product={product} />
          </div>

          {product.colors && product.colors.length > 0 ? (
            <div className="mt-8">
              <p className="font-jost text-xs font-medium uppercase tracking-wide text-brand-dimmed">
                Colour
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`inline-flex items-center gap-2 ${choice.chip(selectedColor === c)}`}
                  >
                    <ColorSwatchDot label={c} size="sm" />
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <p className="font-jost text-xs font-medium uppercase tracking-wide text-brand-dimmed">
              Size
            </p>
            <div className="mt-2">
              <MultiSizeSelector
                sizes={product.sizes}
                value={size}
                onChange={setSize}
                disabled={stock.tone === "out"}
              />
            </div>
            <div className="mt-4">
              <AISizeHelper onApplySize={(s) => setSize(s)} />
            </div>
          </div>

          <div className="mt-8">
            <p className="font-jost text-xs font-medium uppercase tracking-wide text-brand-dimmed">
              Quantity
            </p>
            <QuantityStack productImageUrl={primary} productName={product.name} quantity={qty} />
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={dec}
                className="rounded-lg border border-brand-border px-4 py-2 font-jost text-sm"
              >
                −
              </button>
              <span className="min-w-[2ch] text-center font-jost text-lg">{qty}</span>
              <button
                type="button"
                onClick={inc}
                className="rounded-lg border border-brand-border px-4 py-2 font-jost text-sm"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button
              ref={addToCartBtnRef}
              type="button"
              onClick={addToCart}
              disabled={stock.tone === "out" || !size}
              className={`${choice.cta} flex-1 py-3.5 text-center disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Add to cart
            </button>
            <WishlistButton productId={product.id} variant="circle" className="sm:self-auto" />
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className={`${choice.btn(false)} mt-3 flex w-full items-center justify-center py-3.5 text-center font-semibold text-brand-text hover:border-brand-pink`}
          >
            Chat to order on WhatsApp →
          </a>

          <div className="mt-10">
            <DeliveryEstimator />
          </div>

          <div className="mt-6 rounded-lg border border-brand-border bg-brand-surface p-4 font-jost text-xs text-brand-muted">
            <p>{views} people viewed this today</p>
            {product.popularity_score > 50 ? (
              <p className="mt-2">Popular choice this week</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-brand-border pt-10">
        <details className="group border-b border-brand-border" open>
          <summary className="cursor-pointer list-none py-4 font-jost text-xs font-semibold uppercase tracking-[0.2em] text-brand-text [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-6">
              Product details
              <span className="text-brand-muted group-open:rotate-45 transition-transform">
                +
              </span>
            </span>
          </summary>
          <div className="space-y-3 pb-6 font-jost text-sm leading-relaxed text-brand-muted">
            <p>
              <span className="font-medium text-brand-text">SKU </span>
              {product.sku ?? `YT-${product.id.toUpperCase().slice(0, 8)}`}
            </p>
            {product.category === "DRESS" && labelDressOccasion(product.dressOccasion) ? (
              <p>
                <span className="font-medium text-brand-text">Wear type </span>
                {labelDressOccasion(product.dressOccasion)}
              </p>
            ) : null}
            {product.category === "BAG" && product.bagStyle?.trim() ? (
              <p>
                <span className="font-medium text-brand-text">Bag style </span>
                {product.bagStyle.trim()}
              </p>
            ) : null}
            {product.colors?.length ? (
              <p>
                <span className="font-medium text-brand-text">Colours </span>
                {product.colors.join(", ")}
              </p>
            ) : null}
            {product.totalStockUnits != null && product.totalStockUnits >= 0 ? (
              <p>
                <span className="font-medium text-brand-text">
                  Boutique quantity{" "}
                </span>
                {product.totalStockUnits}
              </p>
            ) : null}
            <p className="text-brand-text">{product.description}</p>
          </div>
        </details>

        <details className="group border-b border-brand-border">
          <summary className="cursor-pointer list-none py-4 font-jost text-xs font-semibold uppercase tracking-[0.2em] text-brand-text [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-6">
              Care instructions
              <span className="text-brand-muted group-open:rotate-45 transition-transform">
                +
              </span>
            </span>
          </summary>
          <div className="space-y-4 pb-6 font-jost text-sm leading-relaxed text-brand-muted">
            {(product.fabricCare ?? "Follow the garment label. When in doubt, dry clean.").split(/\n\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </details>

        <details className="group border-b border-brand-border">
          <summary className="cursor-pointer list-none py-4 font-jost text-xs font-semibold uppercase tracking-[0.2em] text-brand-text [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-6">
              Delivery &amp; returns
              <span className="text-brand-muted group-open:rotate-45 transition-transform">
                +
              </span>
            </span>
          </summary>
          <div className="space-y-3 pb-6 font-jost text-sm leading-relaxed text-brand-muted">
            <p>
              <strong className="text-brand-text">Delivery in Accra: </strong>
              typically  24-48 hours business days after dispatch. Free boutique delivery on orders over GHS 1,000
              where zone rates apply.
            </p>
            <p>
              <strong className="text-brand-text">Nationwide: </strong>
              3–5 business days · standard courier rates apply.
            </p>
            <p>
              <strong className="text-brand-text">Returns: </strong>
              unworn pieces with tags attached within 7 days of delivery. Email{" "}
              <a href="mailto:hello@yanneytrends.com" className="text-brand-pink hover:underline">
                hello@yanneytrends.com
              </a>{" "}
              to start a return.
            </p>
          </div>
        </details>
      </div>

      <OutfitBundleSection products={pairingProducts} />

      <RecentlyViewed currentSlug={product.slug} catalog={catalog} />

      <ProductReviews productId={product.id} productName={product.name} />
    </div>
  );
}
