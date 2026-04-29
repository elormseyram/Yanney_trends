import Link from "next/link";
import { OrderTracker } from "@/components/storefront/OrderTracker";
import { TrackOrderLookup } from "@/components/storefront/TrackOrderLookup";
import { InvoiceReceipt, type ReceiptOrder } from "@/components/storefront/InvoiceReceipt";
import { PaymentSuccessReveal } from "@/components/storefront/PaymentSuccessReveal";
import { buildWhatsAppPrefill } from "@/lib/whatsapp";
import { SHOP_WHATSAPP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

interface TrackPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ surprise?: string; paid?: string }>;
}

export default async function TrackPage({ params, searchParams }: TrackPageProps) {
  const { orderNumber } = await params;
  const { surprise, paid } = await searchParams;
  const isSurprise = surprise === "1";
  const paidState = paid === "1" ? "success" : paid === "0" ? "failed" : null;
  const supabase = await createClient();
  const fullSelect =
    "order_number, fulfillment_type, status, items, payment_status, payment_method, customer_name, customer_phone, customer_email, delivery_address, scheduled_date, scheduled_slot, is_gift_order, subtotal, delivery_fee, discount_amount, total, currency, created_at";
  const safeSelect =
    "order_number, fulfillment_type, status, items, payment_status, customer_name, subtotal, delivery_fee, discount_amount, total, currency, created_at";

  let order: ReceiptOrder | null = null;
  const fullResult = await supabase
    .from("orders")
    .select(fullSelect)
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (fullResult.data) {
    order = fullResult.data as unknown as ReceiptOrder;
  } else if (fullResult.error) {
    const safeResult = await supabase
      .from("orders")
      .select(safeSelect)
      .eq("order_number", orderNumber)
      .maybeSingle();
    order = (safeResult.data as unknown as ReceiptOrder | null) ?? null;
  }

  const wa = buildWhatsAppPrefill(
    `Hi Yanney Trends — question about order ${orderNumber}`,
    SHOP_WHATSAPP,
  );

  const fulfillment = order?.fulfillment_type === "PICKUP" ? "PICKUP" : "DELIVERY";
  const currentStatus = order?.status ?? "PENDING";

  // Just paid — play the celebratory reveal flow.
  if (paidState === "success" && order) {
    return (
      <div className="min-h-screen bg-brand-surface px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-playfair text-xl text-brand-text">Yanney Trends</p>
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
        <p className="font-playfair text-xl text-brand-text">Yanney Trends</p>
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
