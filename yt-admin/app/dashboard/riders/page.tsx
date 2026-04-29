import Link from "next/link";
import { getHubRole } from "@/lib/hub-auth";
import { fetchRidersList } from "@/lib/hub/queries";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { FormFlash } from "@/components/hub/FormFlash";
import { createRider, setRiderActive } from "@/app/actions/hub-riders";

export default async function RidersPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;
  const flash = await searchParams;
  const isOwner = role === "owner";

  const res = await fetchRidersList(false);

  return (
    <>
      <HubTopBar title="Riders" role={role} />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 p-4 sm:p-6">
        <FormFlash err={flash.err} ok={flash.ok} />

        {!res.ok ? <QueryErrorBanner message={res.message} /> : null}

        <div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {isOwner
              ? "Add delivery riders and keep them active. Admins assign riders to delivery orders; export CSV or a printable run sheet per rider."
              : "View riders assigned on orders. Assign a rider from each order’s detail page (delivery fulfilment). Owners manage the rider list."}
          </p>
        </div>

        {isOwner && res.ok ? (
          <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Add rider</h2>
            <form action={createRider} className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="display_name" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Name
                </label>
                <input
                  id="display_name"
                  name="display_name"
                  required
                  placeholder="e.g. Kofi — Zone A"
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+233…"
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                />
              </div>
              <div>
                <label htmlFor="vehicle_note" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Vehicle / ID note
                </label>
                <input
                  id="vehicle_note"
                  name="vehicle_note"
                  placeholder="Motorbike · red"
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Internal notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Add rider
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
          <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-700">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Rider roster</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Name</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Phone</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Vehicle</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Status</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Run sheet</th>
                  {isOwner ? (
                    <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                {res.ok && res.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isOwner ? 6 : 5}
                      className="px-4 py-10 text-center text-stone-500 dark:text-stone-400"
                    >
                      No riders yet.{isOwner ? " Add your first rider above." : " Ask an owner to add riders."}
                    </td>
                  </tr>
                ) : null}
                {res.ok
                  ? res.data.map((r) => (
                      <tr key={r.id} className="dark:bg-stone-900">
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                          {r.display_name}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{r.phone ?? "—"}</td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                          {r.vehicle_note ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {r.is_active ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-600 dark:text-stone-200">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/api/hub/riders/${r.id}/export`}
                              className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                            >
                              Download CSV
                            </a>
                            <span className="text-stone-300 dark:text-stone-600">·</span>
                            <Link
                              href={`/dashboard/riders/${r.id}/run-sheet`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                            >
                              Printable / PDF
                            </Link>
                          </div>
                        </td>
                        {isOwner ? (
                          <td className="px-4 py-3">
                            <form action={setRiderActive} className="inline">
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="is_active" value={r.is_active ? "false" : "true"} />
                              <button
                                type="submit"
                                className="text-xs font-medium text-stone-600 underline-offset-2 hover:text-rose-600 hover:underline dark:text-stone-400 dark:hover:text-rose-400"
                              >
                                {r.is_active ? "Deactivate" : "Reactivate"}
                              </button>
                            </form>
                          </td>
                        ) : null}
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
