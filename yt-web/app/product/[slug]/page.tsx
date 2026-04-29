import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "./product-detail-view";
import { findProductInCatalog, getPairingProducts } from "@/lib/catalog";
import { getCatalogProducts } from "@/lib/catalog.server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const catalog = await getCatalogProducts();
  return catalog.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalogProducts();
  const p = findProductInCatalog(catalog, slug);
  if (!p) return { title: "Product — Yanney Trends" };
  const desc = (p.cardSubtitle ?? p.description).trim().slice(0, 160) || p.name;
  return {
    title: `${p.name} — Yanney Trends`,
    description: desc,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const catalog = await getCatalogProducts();
  const product = findProductInCatalog(catalog, slug);
  if (!product) notFound();

  const pairingProducts = getPairingProducts(product, catalog);

  return (
    <ProductDetailView
      product={product}
      catalog={catalog}
      pairingProducts={pairingProducts}
    />
  );
}
