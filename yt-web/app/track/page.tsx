import Link from "next/link";
import { TrackOrderLookup } from "@/components/storefront/TrackOrderLookup";

export const metadata = {
  title: "Track order | Yanney Trendss",
};

export default function TrackLookupPage() {
  return (
    <div className="min-h-screen bg-brand-surface px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-playfair text-xl text-brand-text">Yanney Trendss</p>
        <h1 className="mt-4 font-playfair text-2xl text-brand-text">Track your order</h1>
        <p className="mt-2 font-jost text-sm text-brand-muted">
          Enter the order reference from your confirmation email or receipt.
        </p>
        <TrackOrderLookup />
        <Link
          href="/shop"
          className="mt-10 inline-block font-jost text-sm text-brand-muted hover:text-brand-pink"
        >
          ← Back to shop
        </Link>
      </div>
    </div>
  );
}
