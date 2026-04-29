import { getHubRole } from "@/lib/hub-auth";
import {
  fetchFrequentCustomers,
  fetchProfilesList,
  fetchRecentOrderContacts,
} from "@/lib/hub/queries";
import { formatDateTime, formatMoney } from "@/lib/hub/format";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";

const FREQUENT_THRESHOLD = 7;

export default async function CustomersPage() {
  const role = await getHubRole();
  if (!role) return null;

  const [profilesRes, contactsRes, frequentRes] = await Promise.all([
    fetchProfilesList(),
    fetchRecentOrderContacts(),
    fetchFrequentCustomers(FREQUENT_THRESHOLD),
  ]);

  return (
    <>
      <HubTopBar title="Customers" role={role} />
      <main className="flex-1 space-y-8 p-4 sm:p-6">
        {!profilesRes.ok ? <QueryErrorBanner message={profilesRes.message} /> : null}
        {!contactsRes.ok ? <QueryErrorBanner message={contactsRes.message} /> : null}
        {!frequentRes.ok ? <QueryErrorBanner message={frequentRes.message} /> : null}

        <section>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Frequent customers
            </h2>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
              {FREQUENT_THRESHOLD}+ orders
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Shoppers who have placed at least {FREQUENT_THRESHOLD} orders. Reach out for thank-yous,
            early access, or loyalty perks.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Name</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Contact</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Orders</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">
                    Total spent
                  </th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">
                    Last order
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-900">
                {frequentRes.ok && frequentRes.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-stone-500 dark:text-stone-400"
                    >
                      No one has hit {FREQUENT_THRESHOLD} orders yet. Keep shipping — they’ll show up
                      here automatically.
                    </td>
                  </tr>
                ) : null}
                {frequentRes.ok
                  ? frequentRes.data.map((c, i) => (
                      <tr
                        key={`${c.customer_email ?? c.customer_phone ?? c.customer_name}-${i}`}
                        className="hover:bg-stone-50 dark:hover:bg-stone-800/60"
                      >
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                          {c.customer_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                          <div>{c.customer_email ?? "—"}</div>
                          <div className="text-xs text-stone-500">{c.customer_phone}</div>
                        </td>
                        <td className="px-4 py-3 text-stone-900 dark:text-stone-100">
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-200">
                            {c.order_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                          {formatMoney(c.total_spent, c.currency)}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                          {formatDateTime(c.last_order_at)}
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Accounts (profiles)
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Customer accounts created when people sign up on the shop.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Name</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">User ID</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-900">
                {profilesRes.ok && profilesRes.data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                      No profiles yet.
                    </td>
                  </tr>
                ) : null}
                {profilesRes.ok
                  ? profilesRes.data.map((row) => (
                      <tr key={row.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/60">
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                          {row.full_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-stone-600 dark:text-stone-400">
                          {row.id}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                          {formatDateTime(row.created_at)}
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Recent checkout contacts
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Customers and guest accounts
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Name</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Email</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Phone</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Last order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-900">
                {contactsRes.ok && contactsRes.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                      No orders to derive contacts from.
                    </td>
                  </tr>
                ) : null}
                {contactsRes.ok
                  ? contactsRes.data.map((row, i) => (
                      <tr key={`${row.customer_email ?? row.customer_phone}-${i}`}>
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                          {row.customer_name}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                          {row.customer_email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                          {row.customer_phone}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                          {formatDateTime(row.last_order_at)}
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
