import type { Metadata } from "next";
import { StylistQuiz } from "./stylist-quiz";
import { getCatalogProducts } from "@/lib/catalog.server";

export const metadata: Metadata = {
  title: "Style Me — Yanney Trendss",
  description: "Find your perfect look in five questions.",
};

export default async function StylistPage({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string }>;
}) {
  const { occasion } = await searchParams;
  const products = await getCatalogProducts();
  const initialOccasion = occasion?.trim() || undefined;
  return <StylistQuiz products={products} initialOccasion={initialOccasion} />;
}
