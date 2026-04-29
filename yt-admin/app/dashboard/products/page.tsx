import Link from "next/link";
import { getHubRole } from "@/lib/hub-auth";
import { fetchProductCategories, fetchProductsList } from "@/lib/hub/queries";
import { formatMoney, humanizeEnum } from "@/lib/hub/format";
import { minStockLabel } from "@/lib/hub/stock";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { FormFlash } from "@/components/hub/FormFlash";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; ok?: string; err?: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;

  const { category: categoryParam, ok, err } = await searchParams;
  const rawCat = typeof categoryParam === "string" ? categoryParam.trim().toUpperCase() : "";

  const [productsRes, categoriesRes] = await Promise.all([
    fetchProductsList(),
    fetchProductCategories(false),
  ]);

  const categoryLabels = new Map<string, string>();
  if (categoriesRes.ok) {
    for (const c of categoriesRes.data) categoryLabels.set(c.slug, c.label);
  }
  const categorySlugs = new Set(categoryLabels.keys());

  const categoryFilter = rawCat && categorySlugs.has(rawCat) ? rawCat : null;

  const res = productsRes;
  const rows =
    res.ok && categoryFilter
      ? res.data.filter((p) => p.category === categoryFilter)
      : res.ok
        ? res.data
        : [];

  return (
    <>
      <HubTopBar title="Inventory" role={role} />
      <main className="flex-1 p-4 sm:p-6">
        <FormFlash err={err} ok={ok} />
        {!res.ok ? <QueryErrorBanner message={res.message} /> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {categoryFilter
              ? `Showing ${categoryLabels.get(categoryFilter) ?? humanizeEnum(categoryFilter)} only.`
              : "Your catalog and how many you have per size. Published pieces appear on the website."}
            {categoryFilter ? (
              <>
                {" "}
                <Link href="/dashboard/products" className="text-rose-600 hover:underline dark:text-rose-400">
                  Clear filter
                </Link>
              </>
            ) : null}
          </p>
          <Link
            href="/dashboard/products/new"
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            Add product
          </Link>
        </div>

        {res.ok && rows.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-stone-300 bg-white py-10 text-center text-sm text-stone-500 md:hidden dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
            No products yet. Use Add product to create your first item.
          </p>
        ) : null}

        {res.ok && rows.length > 0 ? (
          <ul className="mt-6 space-y-3 md:hidden">
            {rows.map((p) => {
              const displayPrice = p.sale_price != null && p.sale_price > 0 ? p.sale_price : p.price;
              const stockHint = minStockLabel(p.sizes);
              return (
                <li
                  key={p.id}
                  className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/products/${p.id}/edit`}
                        className="font-semibold text-rose-600 hover:underline dark:text-rose-400"
                      >
                        {p.name}
                      </Link>
                      <p className="truncate font-mono text-[11px] text-stone-500">{p.slug}</p>
                      {p.card_subtitle?.trim() ? (
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{p.card_subtitle}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-900 dark:text-stone-100">
                        {formatMoney(Number(displayPrice))}
                      </p>
                      {p.sale_price != null && p.sale_price > 0 ? (
                        <p className="text-xs text-stone-400 line-through">{formatMoney(Number(p.price))}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600 dark:text-stone-300">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 dark:bg-stone-800">
                      {categoryLabels.get(p.category) ?? humanizeEnum(p.category)}
                    </span>
                    {p.colors?.length ? (
                      <span className="line-clamp-2">{p.colors.join(", ")}</span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                    <span>{stockHint ?? "—"}</span>
                    {p.is_published ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200">
                        Live
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 font-medium text-stone-700 dark:bg-stone-600 dark:text-stone-200">
                        Draft
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/products/${p.id}/edit`}
                    className="mt-3 flex w-full items-center justify-center rounded-lg border border-stone-300 py-2 text-sm font-medium text-stone-800 dark:border-stone-600 dark:text-stone-100"
                  >
                    Edit product
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="-mx-4 mt-6 hidden overflow-x-auto sm:mx-0 md:block">
          <div className="min-w-full overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-stone-100 dark:bg-stone-800">
              <tr>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Product</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Colors</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Category</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Price</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Stock hint</th>
                <th className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Status</th>
                <th className="px-4 py-3 text-right font-medium text-stone-700 dark:text-stone-300">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-900">
              {res.ok && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-stone-500 dark:text-stone-400">
                    No products yet. Use Add product to create your first item.
                  </td>
                </tr>
              ) : null}
              {res.ok
                ? rows.map((p) => {
                    const displayPrice =
                      p.sale_price != null && p.sale_price > 0 ? p.sale_price : p.price;
                    const stockHint = minStockLabel(p.sizes);
                    return (
                      <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/60">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/products/${p.id}/edit`}
                            className="font-medium text-rose-600 hover:underline dark:text-rose-400"
                          >
                            {p.name}
                          </Link>
                          <div className="text-xs text-stone-500">{p.slug}</div>
                          {p.card_subtitle?.trim() ? (
                            <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                              {p.card_subtitle}
                            </div>
                          ) : null}
                        </td>
                        <td className="max-w-[140px] px-4 py-3 text-xs text-stone-600 dark:text-stone-400">
                          {p.colors?.length
                            ? p.colors.join(", ")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                          {categoryLabels.get(p.category) ?? humanizeEnum(p.category)}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                          {formatMoney(Number(displayPrice))}
                          {p.sale_price != null && p.sale_price > 0 ? (
                            <span className="ml-2 text-xs font-normal text-stone-400 line-through">
                              {formatMoney(Number(p.price))}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                          {stockHint ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {p.is_published ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200">
                              Live
                            </span>
                          ) : (
                            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-600 dark:text-stone-200">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/products/${p.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                            aria-label={`Edit ${p.name}`}
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </>
  );
}
