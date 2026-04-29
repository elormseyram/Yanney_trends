import { redirect } from "next/navigation";
import { getHubContext } from "@/lib/hub-auth";
import { fetchHubStaffList } from "@/lib/hub/teamQueries";
import { formatDateTime } from "@/lib/hub/format";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { FormFlash } from "@/components/hub/FormFlash";
import { inviteHubStaff, removeHubStaff } from "@/app/actions/hub-team";
import { HubStaffRoleSelect } from "@/components/hub/HubStaffRoleSelect";

export default async function OwnerAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const ctx = await getHubContext();
  if (!ctx) return null;
  if (ctx.role !== "owner") {
    redirect(
      "/dashboard?err=" +
        encodeURIComponent("Team & access is owner-only. Ask an owner to manage staff."),
    );
  }
  const flash = await searchParams;

  const res = await fetchHubStaffList();

  return (
    <>
      <HubTopBar title="Team & access" role={ctx.role} />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4 sm:p-6">
        <FormFlash err={flash.err} ok={flash.ok} />
        {!res.ok ? <QueryErrorBanner message={res.message} /> : null}

        <p className="text-sm text-stone-600 dark:text-stone-400">
          Add the people who help run the shop. Admins can manage orders, products, customers, and
          riders. Owners can additionally edit shop settings, reports, and the team list itself.
        </p>

        <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Add team member</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Creates a Yanney Hub login. They can change their password later from the storefront sign-in.
          </p>
          <form action={inviteHubStaff} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="full_name"
                className="text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                required
                placeholder="e.g. Akua Mensah"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="name@example.com"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                Temporary password
              </label>
              <input
                id="password"
                name="password"
                type="text"
                required
                minLength={8}
                autoComplete="off"
                placeholder="At least 8 characters"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="role" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue="admin"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              >
                <option value="admin">Admin — day-to-day operations</option>
                <option value="owner">Owner — full access</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Add team member
              </button>
              <p className="mt-2 text-[11px] text-stone-400">
                Share these credentials privately. The new member can sign in immediately at the hub login.
              </p>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
          <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-700">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Current team</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Name</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Email</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Role</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Added</th>
                  <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                {res.ok && res.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-stone-500 dark:text-stone-400"
                    >
                      No team members yet. Add the first one above.
                    </td>
                  </tr>
                ) : null}
                {res.ok
                  ? res.data.map((m) => {
                      const isSelf = m.user_id === ctx.user.id;
                      return (
                        <tr key={m.user_id} className="dark:bg-stone-900">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                            {m.full_name ?? "—"}
                            {isSelf ? (
                              <span className="ml-2 text-[10px] font-medium uppercase text-rose-500">
                                You
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {m.email ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <HubStaffRoleSelect
                              userId={m.user_id}
                              defaultRole={m.role}
                              disabled={isSelf}
                            />
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                            {formatDateTime(m.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            {!isSelf ? (
                              <form action={removeHubStaff} className="inline">
                                <input type="hidden" name="user_id" value={m.user_id} />
                                <button
                                  type="submit"
                                  className="text-xs font-medium text-stone-600 underline-offset-2 hover:text-rose-600 hover:underline dark:text-stone-400 dark:hover:text-rose-400"
                                >
                                  Remove access
                                </button>
                              </form>
                            ) : (
                              <span className="text-xs text-stone-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
