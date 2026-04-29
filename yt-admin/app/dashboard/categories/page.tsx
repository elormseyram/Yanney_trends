import Link from "next/link";
import { getHubRole } from "@/lib/hub-auth";
import { fetchProductCategories } from "@/lib/hub/queries";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { FormFlash } from "@/components/hub/FormFlash";
import { createCategory } from "@/app/actions/hub-categories";
import { CategoryRowEditor } from "@/components/hub/CategoryRowEditor";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;
  const flash = await searchParams;

  const res = await fetchProductCategories(false);

  return (
    <>
      <HubTopBar title="Categories" role={role} />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4 sm:p-6">
        <FormFlash err={flash.err} ok={flash.ok} />
        {!res.ok ? <QueryErrorBanner message={res.message} /> : null}

        <p className="text-sm text-stone-600 dark:text-stone-400">
          Create the categories shoppers browse on the storefront. Edit a name, swap the hero image,
          re-order, or hide one without losing its products.
        </p>

        <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Add category</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            The slug is the internal id (e.g. <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">JEWELLERY</code>).
            We&apos;ll generate one from the name if you leave it blank.
          </p>
          <form action={createCategory} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="new_label"
                className="text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                Display name
              </label>
              <input
                id="new_label"
                name="label"
                required
                placeholder="e.g. Jewellery"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div>
              <label
                htmlFor="new_slug"
                className="text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                Slug (optional)
              </label>
              <input
                id="new_slug"
                name="slug"
                placeholder="auto from name"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm uppercase tracking-wider dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="new_description"
                className="text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                Description (optional)
              </label>
              <textarea
                id="new_description"
                name="description"
                rows={2}
                placeholder="Short copy for the category landing page"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="new_image"
                className="text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                Image URL (optional)
              </label>
              <input
                id="new_image"
                name="image_url"
                type="url"
                placeholder="https://…"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <div>
              <label
                htmlFor="new_sort"
                className="text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                Sort order
              </label>
              <input
                id="new_sort"
                name="sort_order"
                type="number"
                defaultValue={100}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
              />
            </div>
            <label className="flex items-end gap-2 text-sm text-stone-700 dark:text-stone-200">
              <input
                type="checkbox"
                name="is_visible"
                defaultChecked
                className="rounded border-stone-300"
              />
              Show on storefront
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Add category
              </button>
            </div>
          </form>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              All categories
            </h2>
            <Link
              href="/dashboard/products"
              className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
            >
              View all inventory →
            </Link>
          </div>
          {res.ok && res.data.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900">
              No categories yet. Add your first above.
            </p>
          ) : null}
          <ul className="space-y-3">
            {res.ok
              ? res.data.map((cat) => (
                  <CategoryRowEditor
                    key={cat.slug}
                    category={cat}
                    canDelete={role === "owner"}
                  />
                ))
              : null}
          </ul>
        </section>
      </main>
    </>
  );
}
