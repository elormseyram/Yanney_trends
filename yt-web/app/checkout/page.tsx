import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { type ReceiptOrder } from "@/components/storefront/InvoiceReceipt";

export const dynamic = "force-dynamic";

function OrderHistoryItem({ order }: { order: ReceiptOrder }) {
    const placedAt = order.created_at ? new Date(order.created_at) : null;
    return (
        <Link href={`/track/${order.order_number}`} className="block rounded-lg border border-brand-border bg-brand-surface p-4 transition hover:shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-jost text-sm font-semibold text-brand-text">Order {order.order_number}</p>
                    <p className="font-jost text-xs text-brand-muted">
                        {placedAt ? placedAt.toLocaleDateString("en-GH", { dateStyle: "long" }) : "N/A"}
                    </p>
                </div>
                <span className="rounded-full bg-brand-pink-muted px-3 py-1 font-jost text-xs font-medium text-brand-pink">{order.status}</span>
            </div>
            <p className="mt-2 font-jost text-lg font-semibold text-brand-text">GHS {Number(order.total ?? 0).toFixed(2)}</p>
        </Link>
    )
}

export default async function OrderHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
        <div className="min-h-screen bg-brand-surface py-24 text-center">
            <h1 className="font-playfair text-2xl text-brand-text">Order History</h1>
            <p className="mt-4 font-jost text-brand-muted">Please sign in to view your order history.</p>
            <p className="mt-2 font-jost text-sm text-brand-muted">You can sign in during checkout by verifying your phone number.</p>
            <Link href="/shop" className="mt-8 inline-block rounded-lg bg-brand-pink px-6 py-3 font-jost text-sm font-semibold text-white">
                Continue Shopping
            </Link>
        </div>
    );
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching order history:", error);
  }

  return (
    <div className="min-h-screen bg-brand-surface py-24">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="font-playfair text-3xl text-brand-text">My Orders</h1>
        <p className="mt-2 font-jost text-sm text-brand-muted">A list of your past and current orders with Yanney Trendss.</p>
        
        {orders && orders.length > 0 ? (
            <div className="mt-8 space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {orders.map((order: any) => (
                    <OrderHistoryItem key={order.id} order={order as unknown as ReceiptOrder} />
                ))}
            </div>
        ) : (
            <div className="mt-12 text-center">
                <p className="font-jost text-brand-muted">You haven&apos;t placed any orders yet.</p>
                <Link href="/shop" className="mt-6 inline-block rounded-lg bg-brand-pink px-6 py-3 font-jost text-sm font-semibold text-white">
                    Start Shopping
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}