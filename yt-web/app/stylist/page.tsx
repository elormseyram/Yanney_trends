import type { Metadata } from "next";
import { StylistQuiz } from "./stylist-quiz";
import { getCatalogProducts } from "@/lib/catalog.server";

export const metadata: Metadata = {
  title: "Style Me — Yanney Trends",
  description: "Find your perfect look in five questions.",
};

export default async function StylistPage() {
  const products = await getCatalogProducts();
  return <StylistQuiz products={products} />;
}
