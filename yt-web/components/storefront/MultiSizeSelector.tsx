"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductSize } from "@/types/product";
import { choice } from "@/lib/choiceStyles";
import { getGranularSizeOptions, type SizeSystem } from "@/lib/sizeCharts";

interface MultiSizeSelectorProps {
  sizes: ProductSize[];
  value: string | null;
  onChange: (size: string) => void;
  disabled?: boolean;
}

export function MultiSizeSelector({
  sizes,
  value,
  onChange,
  disabled,
}: MultiSizeSelectorProps) {
  const hasNumeric = useMemo(() => sizes.some((s) => /^\d/.test(s.size.trim())), [sizes]);
  const systems: SizeSystem[] = useMemo(() => {
    if (hasNumeric) return ["EU", "US"];
    return ["LETTER", "EU", "US"];
  }, [hasNumeric]);

  const [system, setSystem] = useState<SizeSystem>(systems[0]);
  const [picked, setPicked] = useState<{ canonical: string; label: string } | null>(null);

  useEffect(() => {
    if (!value) {
      setPicked(null);
      return;
    }
    const opts = getGranularSizeOptions(value, system);
    setPicked({ canonical: value, label: opts[0]?.label ?? value });
  }, [value, system]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {systems.map((sys) => (
          <button
            key={sys}
            type="button"
            disabled={disabled}
            onClick={() => setSystem(sys)}
            className={choice.chip(system === sys)}
          >
            {sys === "LETTER" ? "S / M / L" : sys === "EU" ? "EU sizes" : "US sizes"}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.flatMap((s) => {
          const out = s.stock <= 0;
          const granular = getGranularSizeOptions(s.size, system);
          return granular.map((g) => {
            const active =
              value === g.canonical &&
              picked?.canonical === g.canonical &&
              picked?.label === g.label;
            return (
              <button
                key={`${s.size}-${g.label}-${g.canonical}`}
                type="button"
                disabled={disabled || out}
                title={`Stock: ${s.stock}`}
                onClick={() => {
                  setPicked({ canonical: g.canonical, label: g.label });
                  onChange(g.canonical);
                }}
                className={`${choice.chip(active)} min-w-[2.75rem] text-center ${
                  out ? "cursor-not-allowed opacity-45 line-through" : ""
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/30`}
              >
                {g.label}
              </button>
            );
          });
        })}
      </div>
    </div>
  );
}
