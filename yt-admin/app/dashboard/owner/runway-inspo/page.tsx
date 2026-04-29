import { redirect } from "next/navigation";
import { getHubRole } from "@/lib/hub-auth";
import { fetchRunwayOutfitPosts } from "@/lib/hub/queries";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { FormFlash } from "@/components/hub/FormFlash";
import {
  createRunwayOutfitPost,
  deleteRunwayOutfitPost,
  toggleRunwayOutfitPublish,
} from "@/app/actions/hub-runway";

export default async function RunwayInspoPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;
  if (role !== "owner") {
    redirect(
      "/dashboard?err=" +
        encodeURIComponent("Runway inspo is owner-only. Ask an owner to post curated looks."),
    );
  }

  const flash = await searchParams;
  const res = await fetchRunwayOutfitPosts();
  const posts = res.ok ? res.data : [];
  const shopBase = (process.env.NEXT_PUBLIC_SHOP_URL ?? "http://localhost:3003").replace(/\/$/, "");

  return (
    <>
      <HubTopBar title="Runway inspo" role={role} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 p-4 sm:p-6">
        <FormFlash err={flash.err} ok={flash.ok} />
        {!res.ok ? <QueryErrorBanner message={res.message} /> : null}

        <div>
          <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Curated outfit sets</h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Published looks appear at the top of the storefront{" "}
            <a
              className="text-rose-600 underline dark:text-rose-400"
              href={`${shopBase}/runway`}
              target="_blank"
              rel="noreferrer"
            >
              Inspo / Runway
            </a>{" "}
            board with bundle price and product links.
          </p>
        </div>

        <section className="space-y-3 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">Existing posts</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">No posts yet — add one below.</p>
          ) : (
            <ul className="space-y-3">
              {posts.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 border-b border-stone-100 pb-3 last:border-0 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{p.title}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      GHS {Number(p.bundle_price_ghs).toFixed(2)} · {p.product_ids.length} product(s) ·{" "}
                      {p.is_published ? "Live" : "Draft"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleRunwayOutfitPublish}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="next" value={p.is_published ? "false" : "true"} />
                      <button
                        type="submit"
                        className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 dark:border-stone-600 dark:text-stone-200"
                      >
                        {p.is_published ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <form action={deleteRunwayOutfitPost} className="inline">
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">Add outfit post</h2>
          <form action={createRunwayOutfitPost} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                placeholder="e.g. Sunday brunch set"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400" htmlFor="subtitle">
                Subtitle (optional)
              </label>
              <input
                id="subtitle"
                name="subtitle"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                placeholder="Short line under the title"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400" htmlFor="hero_image_url">
                Hero image URL
              </label>
              <input
                id="hero_image_url"
                name="hero_image_url"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400" htmlFor="product_ids">
                Product IDs (UUIDs, comma or space separated)
              </label>
              <textarea
                id="product_ids"
                name="product_ids"
                rows={2}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-xs dark:border-stone-600 dark:bg-stone-950"
                placeholder="Copy from Inventory → product detail"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400" htmlFor="bundle_price_ghs">
                  Bundle price (GHS)
                </label>
                <input
                  id="bundle_price_ghs"
                  name="bundle_price_ghs"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={0}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400" htmlFor="sort_order">
                  Sort order
                </label>
                <input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={0}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
              <input type="checkbox" name="is_published" />
              Publish immediately
            </label>
            <button
              type="submit"
              className="rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Save post
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
