import Link from "next/link";
import { notFound } from "next/navigation";
import { getHubRole } from "@/lib/hub-auth";
import { createClient } from "@/lib/supabase/server";
import { fetchRiderOrdersDetailed } from "@/lib/hub/queries";
import { summarizeOrderItems } from "@/lib/hub/riderExport";
import { formatMoney, formatDateTime, humanizeEnum } from "@/lib/hub/format";
import { PrintRunSheetButton } from "@/components/hub/PrintRunSheetButton";
import { HubTopBar } from "@/components/hub/HubTopBar";

export default async function RiderRunSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;

  const { id } = await params;
  const supabase = await createClient();
  const { data: rider, error } = await supabase
    .from("delivery_riders")
    .select("id, display_name, phone, vehicle_note")
    .eq("id", id)
    .maybeSingle();

  if (error || !rider) notFound();

  const ordersRes = await fetchRiderOrdersDetailed(id);
  const orders = ordersRes.ok ? ordersRes.data : [];

  return (
    <>
      <div className="print:hidden">
        <HubTopBar title={`Run sheet · ${rider.display_name as string}`} role={role} />
      </div>
      <div className="mx-auto max-w-4xl flex-1 px-4 py-6 print:max-w-none print:px-6 print:py-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/dashboard/riders"
            className="text-sm text-rose-600 hover:underline dark:text-rose-400"
          >
            ← Riders
          </Link>
          <div className="flex gap-2">
            <a
              href={`/api/hub/riders/${id}/export`}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              Download CSV
            </a>
            <PrintRunSheetButton />
          </div>
        </div>

        <header className="border-b border-stone-300 pb-4 dark:border-stone-600">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Rider run sheet</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {rider.display_name as string}
          </h1>
          <div className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            {(rider.phone as string | null) ? <span>Phone: {rider.phone}</span> : null}
            {(rider.phone as string | null) && (rider.vehicle_note as string | null) ? (
              <span className="mx-2">·</span>
            ) : null}
            {(rider.vehicle_note as string | null) ? (
              <span>Vehicle: {rider.vehicle_note}</span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-stone-500">
            {orders.length} order{orders.length === 1 ? "" : "s"} assigned · Generated{" "}
            {formatDateTime(new Date().toISOString())}
          </p>
        </header>

        {orders.length === 0 ? (
          <p className="mt-10 text-center text-stone-500 dark:text-stone-400">
            No orders are assigned to this rider yet.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            {orders.map((o, idx) => (
              <article
                key={o.id}
                className="break-inside-avoid rounded-lg border border-stone-200 p-4 dark:border-stone-700"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-100 pb-2 dark:border-stone-800">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    {idx + 1}. {o.order_number}
                  </span>
                  <span className="text-sm text-stone-500">{formatDateTime(o.created_at)}</span>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase text-stone-500">Customer</dt>
                    <dd className="font-medium text-stone-900 dark:text-stone-100">{o.customer_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-stone-500">Phone</dt>
                    <dd>{o.customer_phone}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase text-stone-500">Email</dt>
                    <dd>{o.customer_email ?? "—"}</dd>
                  </div>
                  {o.delivery_address ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase text-stone-500">Address</dt>
                      <dd className="whitespace-pre-wrap">{o.delivery_address}</dd>
                    </div>
                  ) : null}
                  {(o.scheduled_date ?? o.scheduled_slot) ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase text-stone-500">Schedule</dt>
                      <dd>
                        {o.scheduled_date ?? ""} {o.scheduled_slot ?? ""}
                      </dd>
                    </div>
                  ) : null}
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase text-stone-500">Items</dt>
                    <dd>{summarizeOrderItems(o.items) || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-stone-500">Total</dt>
                    <dd className="font-semibold">{formatMoney(Number(o.total), o.currency)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-stone-500">Status / payment</dt>
                    <dd>
                      {humanizeEnum(o.status)} · {humanizeEnum(o.payment_status)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-stone-500">Fulfilment</dt>
                    <dd>{humanizeEnum(o.fulfillment_type)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </>
  );
}
