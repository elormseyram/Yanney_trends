import { RunwayCatalog } from "@/components/storefront/RunwayCatalog";
import { getCatalogProducts } from "@/lib/catalog.server";

export const metadata = {
  title: "Inspo — Yanney Trends",
  description: "Browse the collection in a Pinterest-style inspiration board.",
};

export default async function RunwayPage() {
  const products = await getCatalogProducts();
  return <RunwayCatalog products={products} />;
}
