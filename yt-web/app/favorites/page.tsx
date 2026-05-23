import type { Metadata } from "next";
import { getCatalogProducts } from "@/lib/catalog.server";
import { FavoritesView } from "@/components/storefront/FavoritesView";

export const metadata: Metadata = {
  title: "Your Wishlist | Yanney Trendss",
  description: "View the luxury fashion pieces you've saved to your wishlist.",
};

export default async function FavoritesPage() {
  // Fetch all products on the server so the client view can instantly map IDs to full product data
  const catalog = await getCatalogProducts();

  return <FavoritesView catalog={catalog} />;
}