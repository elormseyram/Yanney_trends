"use client";

import { useState } from "react";
import { deleteCategory, updateCategory } from "@/app/actions/hub-categories";
import type { ProductCategoryRow } from "@/lib/hub/types";

export function CategoryRowEditor({
  category,
  canDelete,
}: {
  category: ProductCategoryRow;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {category.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.image_url}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-xs font-semibold text-rose-500 dark:bg-rose-500/10">
              {category.label.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-stone-900 dark:text-stone-100">
              {category.label}
            </p>
            <p className="truncate font-mono text-[11px] text-stone-500 dark:text-stone-400">
              {category.slug}
            </p>
            {category.description ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
                {category.description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              category.is_visible
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                : "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
            }`}
          >
            {category.is_visible ? "Visible" : "Hidden"}
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
          >
            {open ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {open ? (
        <form action={updateCategory} className="mt-4 grid gap-3 border-t border-stone-200 pt-4 dark:border-stone-700 sm:grid-cols-2">
          <input type="hidden" name="slug" value={category.slug} />
          <div className="sm:col-span-2">
            <label
              htmlFor={`label-${category.slug}`}
              className="text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Display name
            </label>
            <input
              id={`label-${category.slug}`}
              name="label"
              defaultValue={category.label}
              required
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor={`description-${category.slug}`}
              className="text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Description
            </label>
            <textarea
              id={`description-${category.slug}`}
              name="description"
              rows={2}
              defaultValue={category.description ?? ""}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor={`image-${category.slug}`}
              className="text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Image URL
            </label>
            <input
              id={`image-${category.slug}`}
              name="image_url"
              type="url"
              defaultValue={category.image_url ?? ""}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
          <div>
            <label
              htmlFor={`sort-${category.slug}`}
              className="text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Sort order
            </label>
            <input
              id={`sort-${category.slug}`}
              name="sort_order"
              type="number"
              defaultValue={category.sort_order}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
          <label className="flex items-end gap-2 text-sm text-stone-700 dark:text-stone-200">
            <input
              type="checkbox"
              name="is_visible"
              defaultChecked={category.is_visible}
              className="rounded border-stone-300"
            />
            Show on storefront
          </label>
          <div className="flex flex-wrap justify-between gap-2 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Save changes
            </button>
            {canDelete ? (
              <DeleteCategoryButton slug={category.slug} label={category.label} />
            ) : null}
          </div>
        </form>
      ) : null}
    </li>
  );
}

function DeleteCategoryButton({ slug, label }: { slug: string; label: string }) {
  return (
    <form
      action={deleteCategory}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete "${label}"? This only removes the category — products in it must be moved or deleted first.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
      >
        Delete category
      </button>
    </form>
  );
}
