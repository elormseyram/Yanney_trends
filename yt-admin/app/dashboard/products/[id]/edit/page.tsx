import Link from "next/link";
import { notFound } from "next/navigation";
import { getHubRole } from "@/lib/hub-auth";
import { fetchProductById, fetchProductCategories } from "@/lib/hub/queries";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { updateProduct } from "@/app/actions/hub-products";
import { FormFlash } from "@/components/hub/FormFlash";
import { ProductMerchandisingFormFields } from "@/components/hub/ProductMerchandisingFormFields";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const { id } = await params;
  const flash = await searchParams;
  const role = await getHubRole();
  if (!role) return null;

  const [res, catRes] = await Promise.all([
    fetchProductById(id),
    fetchProductCategories(false),
  ]);
  if (!res.ok && res.message === "Product not found") notFound();
  if (!res.ok) {
    return (
      <>
        <HubTopBar title="Edit product" role={role} />
        <main className="flex-1 p-4 sm:p-6">
          <QueryErrorBanner message={res.message} />
        </main>
      </>
    );
  }

  const p = res.data;
  const sizesJson = JSON.stringify(p.sizes ?? [], null, 2);
  const imagesJson = JSON.stringify(p.images ?? [], null, 2);
  const colors = p.colors as string[] | undefined;
  const categories = catRes.ok
    ? catRes.data.map((c) => ({ slug: c.slug, label: c.label }))
    : [];

  return (
    <>
      <HubTopBar title="Edit product" role={role} />
      <main className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-6">
        <FormFlash err={flash.err} ok={flash.ok} />
        {!catRes.ok ? <QueryErrorBanner message={catRes.message} /> : null}
        <Link
          href="/dashboard/products"
          className="text-sm text-rose-600 hover:underline dark:text-rose-400"
        >
          ← Products
        </Link>

        <form
          action={updateProduct}
          className="mt-6 space-y-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900"
        >
          <input type="hidden" name="id" value={id} />
          <ProductMerchandisingFormFields
            variant="edit"
            showSizesImages
            categories={categories}
            defaults={{
              name: String(p.name ?? ""),
              slug: String(p.slug ?? ""),
              card_subtitle: (p.card_subtitle as string | null) ?? null,
              description: (p.description as string | null) ?? null,
              fabric_care: (p.fabric_care as string | null) ?? null,
              category: String(p.category ?? "DRESS"),
              dress_occasion: (p.dress_occasion as string | null) ?? null,
              bag_style: (p.bag_style as string | null) ?? null,
              colors: Array.isArray(colors) ? colors : [],
              total_stock_units: (p.total_stock_units as number | null) ?? null,
              price: Number(p.price),
              sale_price: p.sale_price != null ? Number(p.sale_price) : null,
              sizes_json: sizesJson,
              images_json: imagesJson,
              is_published: Boolean(p.is_published),
              is_featured: Boolean(p.is_featured),
            }}
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Save changes
          </button>
        </form>
      </main>
    </>
  );
}
