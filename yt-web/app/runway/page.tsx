import { RunwayCatalog } from "@/components/storefront/RunwayCatalog";
import { getCatalogProducts } from "@/lib/catalog.server";
import { getRunwayOutfitPosts } from "@/lib/runway.server";

export const revalidate = 30;

export const metadata = {
  title: "Inspo — Yanney Trends",
  description: "Browse the collection in a Pinterest-style inspiration board.",
};

export default async function RunwayPage() {
  const [products, outfitPosts] = await Promise.all([getCatalogProducts(), getRunwayOutfitPosts()]);
  return <RunwayCatalog products={products} outfitPosts={outfitPosts} />;
}
