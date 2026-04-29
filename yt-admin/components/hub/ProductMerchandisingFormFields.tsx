import { ProductSizesImagesEditor } from "@/components/hub/ProductSizesImagesEditor";
import {
  CategoryCareFields,
  type CategoryOption,
} from "@/components/hub/CategoryCareFields";

export type ProductFormDefaults = {
  name?: string;
  slug?: string;
  card_subtitle?: string | null;
  description?: string | null;
  category?: string;
  dress_occasion?: string | null;
  bag_style?: string | null;
  colors?: string[] | null;
  fabric_care?: string | null;
  total_stock_units?: number | null;
  price?: number;
  sale_price?: number | null;
  sizes_json?: string;
  images_json?: string;
  is_published?: boolean;
  is_featured?: boolean;
};

export function ProductMerchandisingFormFields({
  defaults,
  showSizesImages = true,
  variant = "create",
  categories,
}: {
  defaults?: ProductFormDefaults;
  /** New product can skip sizes/images until edit */
  showSizesImages?: boolean;
  variant?: "create" | "edit";
  categories: ReadonlyArray<CategoryOption>;
}) {
  const d = defaults ?? {};
  const colorsLine = Array.isArray(d.colors) ? d.colors.join(", ") : "";

  return (
    <>
      <div className="rounded-lg border border-rose-200/60 bg-rose-50/40 p-4 dark:border-rose-500/25 dark:bg-rose-500/5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
          Storefront product card
        </h3>
        <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
          These fields mirror what shoppers see on listing cards (name, subtitle, colours, stock line).
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="name" className="text-xs font-medium text-stone-600 dark:text-stone-400">
              Product name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={d.name ?? ""}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
          <div>
            <label
              htmlFor="card_subtitle"
              className="text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Card subtitle
            </label>
            <input
              id="card_subtitle"
              name="card_subtitle"
              placeholder="e.g. Midi · Stretch satin"
              defaultValue={d.card_subtitle ?? ""}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
          <div>
            <label htmlFor="colors" className="text-xs font-medium text-stone-600 dark:text-stone-400">
              Colours (comma-separated)
            </label>
            <input
              id="colors"
              name="colors"
              placeholder="Blush, Onyx, Ivory"
              defaultValue={colorsLine}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
          <div>
            <label
              htmlFor="total_stock_units"
              className="text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Total units (card headline, optional)
            </label>
            <input
              id="total_stock_units"
              name="total_stock_units"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Leave blank to sum size rows"
              defaultValue={
                typeof d.total_stock_units === "number" && d.total_stock_units > 0
                  ? d.total_stock_units
                  : ""
              }
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-600 dark:bg-stone-900/40">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-400">
          Product detail page
        </h3>
        <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
          Long description, care label, and merchandising tags for dresses and bags.
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="slug" className="text-xs font-medium text-stone-600 dark:text-stone-400">
              URL slug {variant === "create" ? "(optional — auto from name)" : ""}
            </label>
            <input
              id="slug"
              name="slug"
              required={variant === "edit"}
              placeholder={variant === "create" ? "auto from name" : ""}
              defaultValue={d.slug ?? ""}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Full description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={d.description ?? ""}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>

          <CategoryCareFields
            categories={categories}
            defaultCategory={d.category ?? "DRESS"}
            defaultCare={d.fabric_care ?? ""}
            defaultDressOccasion={d.dress_occasion ?? ""}
            defaultBagStyle={d.bag_style ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="text-xs font-medium text-stone-600 dark:text-stone-400">
            Price (GHS)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={d.price ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
          />
        </div>
        <div>
          <label htmlFor="sale_price" className="text-xs font-medium text-stone-600 dark:text-stone-400">
            Sale price (optional)
          </label>
          <input
            id="sale_price"
            name="sale_price"
            type="number"
            step="0.01"
            min={0}
            defaultValue={d.sale_price != null ? Number(d.sale_price) : ""}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
          />
        </div>
      </div>

      {showSizesImages ? (
        <ProductSizesImagesEditor
          sizesJson={d.sizes_json ?? "[]"}
          imagesJson={d.images_json ?? "[]"}
        />
      ) : (
        <>
          <input type="hidden" name="sizes_json" value="[]" />
          <input type="hidden" name="images_json" value="[]" />
        </>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-stone-700 dark:text-stone-200">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={d.is_published ?? false}
            className="rounded border-stone-300"
          />
          Published on storefront
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={d.is_featured ?? false}
            className="rounded border-stone-300"
          />
          Featured collection
        </label>
      </div>
    </>
  );
}
