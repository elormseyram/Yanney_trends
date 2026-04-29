import { getHubRole } from "@/lib/hub-auth";
import { fetchExpensesList } from "@/lib/hub/queries";
import { formatMoney, formatDate } from "@/lib/hub/format";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { FormFlash } from "@/components/hub/FormFlash";
import { createExpense } from "@/app/actions/hub-expenses";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;
  const flash = await searchParams;

  const res = await fetchExpensesList();

  return (
    <>
      <HubTopBar title="Expenses" role={role} />
      <main className="flex-1 space-y-8 p-4 sm:p-6">
        <FormFlash err={flash.err} ok={flash.ok} />
        {!res.ok ? <QueryErrorBanner message={res.message} /> : null}

        <p className="text-sm text-stone-600 dark:text-stone-400">
          Track spend the boutique incurs (logistics, packaging, ads, etc.). Visible to all hub staff.
        </p>

        <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Add expense</h2>
          <form action={createExpense} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <label htmlFor="title" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div>
              <label htmlFor="category" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Category
              </label>
              <input
                id="category"
                name="category"
                placeholder="e.g. logistics, packaging"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div>
              <label htmlFor="amount" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min={0}
                required
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div>
              <label htmlFor="currency" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Currency
              </label>
              <input
                id="currency"
                name="currency"
                defaultValue="GHS"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div>
              <label
                htmlFor="incurred_on"
                className="text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                Date
              </label>
              <input
                id="incurred_on"
                name="incurred_on"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div>
              <label htmlFor="vendor" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Vendor (optional)
              </label>
              <input
                id="vendor"
                name="vendor"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label htmlFor="notes" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="rounded-lg bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Log expense
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Recent entries</h2>
          <div className="-mx-4 mt-3 overflow-x-auto sm:mx-0">
            <div className="min-w-full overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Date</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Title</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Category</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Amount</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-900">
                {res.ok && res.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                      No expenses logged yet.
                    </td>
                  </tr>
                ) : null}
                {res.ok
                  ? res.data.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                          {formatDate(row.incurred_on)}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                          {row.title}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{row.category}</td>
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                          {formatMoney(Number(row.amount), row.currency)}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{row.vendor ?? "—"}</td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
