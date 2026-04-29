"use client";

import { useMemo, useState } from "react";
import { DRESS_OCCASIONS } from "@/lib/hub/product-form";
import { humanizeEnum } from "@/lib/hub/format";
import {
  CARE_TEMPLATES,
  isTemplateText,
  templateForCategory,
} from "@/lib/hub/careTemplates";

export type CategoryOption = { slug: string; label: string };

export function CategoryCareFields({
  categories,
  defaultCategory,
  defaultCare,
  defaultDressOccasion,
  defaultBagStyle,
}: {
  categories: ReadonlyArray<CategoryOption>;
  defaultCategory: string;
  defaultCare: string;
  defaultDressOccasion: string;
  defaultBagStyle: string;
}) {
  const [category, setCategory] = useState<string>(defaultCategory || "DRESS");
  const [care, setCare] = useState<string>(defaultCare ?? "");
  const [dressOccasion, setDressOccasion] = useState<string>(defaultDressOccasion ?? "");
  const [bagStyle, setBagStyle] = useState<string>(defaultBagStyle ?? "");
  const [appliedAuto, setAppliedAuto] = useState<boolean>(false);

  const templateForCurrent = useMemo(() => templateForCategory(category), [category]);
  const hasBuiltinTemplate = category in CARE_TEMPLATES;
  const careMatchesTemplate = isTemplateText(care);
  const careIsEmpty = care.trim().length === 0;

  const handleCategoryChange = (next: string) => {
    setCategory(next);
    setAppliedAuto(false);
    if (careIsEmpty || careMatchesTemplate) {
      setCare(templateForCategory(next));
      setAppliedAuto(true);
    }
  };

  const applyTemplate = () => {
    setCare(templateForCurrent);
    setAppliedAuto(true);
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="text-xs font-medium text-stone-600 dark:text-stone-400">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
          >
            {categories.length === 0 ? <option value="DRESS">Dress</option> : null}
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {category === "DRESS" ? (
          <div>
            <label
              htmlFor="dress_occasion"
              className="text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Dress wear type
            </label>
            <select
              id="dress_occasion"
              name="dress_occasion"
              value={dressOccasion}
              onChange={(e) => setDressOccasion(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            >
              {DRESS_OCCASIONS.map((o) => (
                <option key={o || "none"} value={o}>
                  {o === ""
                    ? "— Not specified —"
                    : o === "BOTH"
                      ? "Casual & dinner"
                      : humanizeEnum(o)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="dress_occasion" value="" />
        )}
      </div>

      {category === "BAG" ? (
        <div>
          <label htmlFor="bag_style" className="text-xs font-medium text-stone-600 dark:text-stone-400">
            Bag type / style
          </label>
          <input
            id="bag_style"
            name="bag_style"
            placeholder="e.g. Structured tote, Mini clutch, Crossbody"
            value={bagStyle}
            onChange={(e) => setBagStyle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
          />
        </div>
      ) : (
        <input type="hidden" name="bag_style" value="" />
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="fabric_care"
            className="text-xs font-medium text-stone-600 dark:text-stone-400"
          >
            Care instructions
          </label>
          <div className="flex items-center gap-2">
            {appliedAuto && hasBuiltinTemplate ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                Template applied
              </span>
            ) : null}
            {hasBuiltinTemplate && care.trim() !== templateForCurrent.trim() ? (
              <button
                type="button"
                onClick={applyTemplate}
                className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
              >
                Use {category.replace(/_/g, " ").toLowerCase()} template
              </button>
            ) : null}
          </div>
        </div>
        <textarea
          id="fabric_care"
          name="fabric_care"
          rows={5}
          value={care}
          onChange={(e) => {
            setCare(e.target.value);
            setAppliedAuto(false);
          }}
          placeholder="One short instruction per line."
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
        />
        <p className="mt-1 text-[11px] text-stone-400">
          {hasBuiltinTemplate
            ? "Template fills in when this is empty. Edit freely after."
            : "Custom category — write care notes manually."}
        </p>
      </div>
    </>
  );
}
