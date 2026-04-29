import { HeroSection } from "@/components/storefront/home/HeroSection";
import { MarqueeTicker } from "@/components/storefront/MarqueeTicker";
import { HomeVisitTeaser } from "@/components/storefront/home/HomeVisitTeaser";
import { CategoryShowcase } from "@/components/storefront/home/CategoryShowcase";
import { BestSellersSection } from "@/components/storefront/home/BestSellersSection";
import { TrustBadgesSection } from "@/components/storefront/home/TrustBadgesSection";
import { RunwayEntryBand } from "@/components/storefront/home/RunwayEntryBand";
import { StylistTeaserSection } from "@/components/storefront/home/StylistTeaserSection";
import { LookbookStrip } from "@/components/storefront/home/LookbookStrip";
import { HomeContactTeaser } from "@/components/storefront/home/HomeContactTeaser";
import { TestimonialsSection } from "@/components/storefront/home/TestimonialsSection";
import { DeliveryPromiseStrip } from "@/components/storefront/home/DeliveryPromiseStrip";
import { getCategoryShowcaseCounts, pickFeaturedProducts } from "@/lib/catalog";
import { getCatalogProducts } from "@/lib/catalog.server";

export const revalidate = 60;

export default async function HomePage() {
  const catalog = await getCatalogProducts();
  const categoryCounts = getCategoryShowcaseCounts(catalog);
  const featured = pickFeaturedProducts(catalog, 8);

  return (
    <>
      <HeroSection />
      <MarqueeTicker variant="dark" />
      <HomeVisitTeaser />
      <CategoryShowcase counts={categoryCounts} />
      <BestSellersSection products={featured} />
      <TrustBadgesSection />
      <RunwayEntryBand />
      <StylistTeaserSection />
      <LookbookStrip />
      <HomeContactTeaser />
      <TestimonialsSection />
      <DeliveryPromiseStrip />
    </>
  );
}
