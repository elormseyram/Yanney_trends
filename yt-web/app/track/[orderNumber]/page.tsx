import Link from "next/link";
import { OrderTracker } from "@/components/storefront/OrderTracker";
import { TrackOrderLookup } from "@/components/storefront/TrackOrderLookup";
import { InvoiceReceipt, type ReceiptOrder } from "@/components/storefront/InvoiceReceipt";
import { PaymentSuccessReveal } from "@/components/storefront/PaymentSuccessReveal";
import { buildWhatsAppPrefill } from "@/lib/whatsapp";
import { SHOP_WHATSAPP } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TrackPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ surprise?: string; paid?: string }>;
}

export default async function TrackPage({ params, searchParams }: TrackPageProps) {
  const { orderNumber } = await params;
  const { surprise, paid } = await searchParams;
  const isSurprise = surprise === "1";
  const paidState = paid === "1" ? "success" : paid === "0" ? "failed" : null;
  
  // Use the admin client to bypass RLS so unauthenticated guests can track their order
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) console.error("[Track] Supabase error fetching order:", error.message);
  const order = data as unknown as ReceiptOrder | null;

  const wa = buildWhatsAppPrefill(
    `Hi Yanney Trendss — question about order ${orderNumber}`,
    SHOP_WHATSAPP,
  );

  const fulfillment = order?.fulfillment_type === "PICKUP" ? "PICKUP" : "DELIVERY";
  const currentStatus = order?.status ?? "PENDING";

  // Just paid — play the celebratory reveal flow.
  if (paidState === "success" && order) {
    return (
      <div className="min-h-screen bg-brand-surface px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-playfair text-xl text-brand-text">Yanney Trendss</p>
          <p className="mt-2 font-jost text-sm text-brand-muted">{orderNumber}</p>
        </div>
        <div className="mx-auto mt-8 max-w-lg">
          <PaymentSuccessReveal
            order={order}
            fulfillment={fulfillment}
            currentStatus={currentStatus}
            surprise={isSurprise}
          />
        </div>
        <div className="mx-auto mt-8 max-w-lg space-y-4 font-jost text-sm">
          <a
            href={wa}
            className="block text-center text-brand-pink hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Questions? Chat on WhatsApp →
          </a>
          <Link href="/shop" className="block text-center text-brand-muted hover:text-brand-pink">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="text-center font-jost text-xs text-brand-muted">
          Looking for a different order? Enter the reference below.
        </p>
        <TrackOrderLookup initial={orderNumber} />
      </div>
      <div className="mx-auto mt-10 max-w-lg text-center">
        <p className="font-playfair text-xl text-brand-text">Yanney Trendss</p>
        {isSurprise ? (
          <>
            <p className="mt-6 flex items-center justify-center gap-2 font-playfair text-2xl text-brand-text">
              A gift from someone special
              <svg
                className="inline h-7 w-7 text-brand-pink"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <path d="M12 21s-7-4.35-7-10a5 5 0 0 1 9.9-1 5 5 0 0 1 9.1 1c0 5.65-7 10-7 10Z" strokeLinejoin="round" />
              </svg>
            </p>
            <p className="mt-3 font-jost text-sm text-brand-muted">
              Order {orderNumber} — updates only.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 font-playfair text-2xl text-brand-text">Track order</h1>
            <p className="mt-2 font-jost text-sm text-brand-muted">{orderNumber}</p>
          </>
        )}

        {order?.schedule_decision_note ? (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-brand-pink/30 bg-brand-pink/5 p-4 text-left text-sm text-brand-text">
            <p className="font-semibold text-brand-pink">Message regarding your schedule:</p>
            <p className="mt-1 font-jost text-brand-muted">{order.schedule_decision_note}</p>
          </div>
        ) : null}
      </div>
      <div className="mx-auto mt-10 max-w-lg">
        {paidState === "failed" && order?.payment_status !== "PAID" ? (
          <p className="mb-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            Payment was not completed. You can try again from checkout.
          </p>
        ) : null}
        <OrderTracker
          fulfillment={fulfillment}
          currentStatus={currentStatus}
          surprise={isSurprise}
        />
      </div>
      {order ? (
        <div className="mx-auto mt-10 max-w-lg">
          <InvoiceReceipt order={order} />
        </div>
      ) : null}
      <div className="mx-auto mt-6 max-w-lg space-y-4 font-jost text-sm">
        <a href={wa} className="block text-center text-brand-pink hover:underline" target="_blank" rel="noreferrer">
          Questions? Chat on WhatsApp →
        </a>
        <Link href="/shop" className="block text-center text-brand-muted hover:text-brand-pink">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
