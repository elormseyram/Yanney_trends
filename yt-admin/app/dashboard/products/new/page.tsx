import Link from "next/link";
import { getHubRole } from "@/lib/hub-auth";
import { fetchProductCategories } from "@/lib/hub/queries";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { createProduct } from "@/app/actions/hub-products";
import { FormFlash } from "@/components/hub/FormFlash";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { ProductMerchandisingFormFields } from "@/components/hub/ProductMerchandisingFormFields";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;
  const flash = await searchParams;
  const catRes = await fetchProductCategories(false);
  const categories = catRes.ok
    ? catRes.data.map((c) => ({ slug: c.slug, label: c.label }))
    : [];

  return (
    <>
      <HubTopBar title="New product" role={role} />
      <main className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-6">
        <FormFlash err={flash.err} />
        {!catRes.ok ? <QueryErrorBanner message={catRes.message} /> : null}
        <Link
          href="/dashboard/products"
          className="text-sm text-rose-600 hover:underline dark:text-rose-400"
        >
          ← Products
        </Link>

        <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
          Same order as the website: short lines for the card, then the full story and care notes, price, sizes and stock,
          then photos — use the rows and buttons below.
        </p>

        <form
          action={createProduct}
          className="mt-6 space-y-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900"
        >
          <ProductMerchandisingFormFields
            variant="create"
            showSizesImages
            categories={categories}
            defaults={{
              sizes_json: "[]",
              images_json: "[]",
            }}
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Create product
          </button>
        </form>
      </main>
    </>
  );
}
