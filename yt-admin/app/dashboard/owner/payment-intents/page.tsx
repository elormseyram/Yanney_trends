import { getHubRole } from "@/lib/hub-auth";
import { fetchPaymentIntents } from "@/lib/hub/queries";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { formatMoney, formatDateTime } from "@/lib/hub/format";

function amountFromPesewas(amountPesewas: number, currency: string) {
  return formatMoney(Number(amountPesewas ?? 0) / 100, currency || "GHS");
}

export default async function OwnerPaymentIntentsPage() {
  const role = await getHubRole();
  if (!role) return null;

  const res = await fetchPaymentIntents(250);
  const rows = res.ok ? res.data : [];

  const initiated = rows.filter((r) => (r.status ?? "").toUpperCase() === "INITIATED").length;
  const paid = rows.filter((r) => (r.status ?? "").toUpperCase() === "PAID").length;
  const failed = rows.filter((r) => (r.status ?? "").toUpperCase() === "FAILED").length;

  return (
    <>
      <HubTopBar title="Payment intents" role={role} />
      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Owner-only debug panel for checkout attempts before final orders are materialized.
        </p>
        {!res.ok ? <QueryErrorBanner message={res.message} /> : null}

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">Initiated</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-100">{initiated}</p>
          </article>
          <article className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">Paid</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{paid}</p>
          </article>
          <article className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">Failed</p>
            <p className="mt-2 text-2xl font-semibold text-rose-700 dark:text-rose-300">{failed}</p>
          </article>
        </section>

        <section className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-stone-100 dark:bg-stone-800">
              <tr>
                <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Reference</th>
                <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Status</th>
                <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Amount</th>
                <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Email</th>
                <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Created</th>
                <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Paid</th>
                <th className="px-3 py-2 font-medium text-stone-700 dark:text-stone-300">Converted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-900">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-stone-500 dark:text-stone-400">
                    No payment intents yet.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => {
                const status = (row.status ?? "").toUpperCase();
                return (
                  <tr key={row.reference}>
                    <td className="px-3 py-2 font-medium text-stone-900 dark:text-stone-100">{row.reference}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          status === "PAID"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                            : status === "FAILED"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200"
                              : "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
                        }`}
                      >
                        {status || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-stone-700 dark:text-stone-300">
                      {amountFromPesewas(row.amount_pesewas, row.currency)}
                    </td>
                    <td className="px-3 py-2 text-stone-600 dark:text-stone-400">{row.customer_email ?? "—"}</td>
                    <td className="px-3 py-2 text-stone-600 dark:text-stone-400">{formatDateTime(row.created_at)}</td>
                    <td className="px-3 py-2 text-stone-600 dark:text-stone-400">
                      {row.paid_at ? formatDateTime(row.paid_at) : "—"}
                    </td>
                    <td className="px-3 py-2 text-stone-600 dark:text-stone-400">
                      {row.converted_at ? formatDateTime(row.converted_at) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
