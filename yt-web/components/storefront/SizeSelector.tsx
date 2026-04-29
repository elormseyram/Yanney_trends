"use client";

import type { ProductSize } from "@/types/product";

interface SizeSelectorProps {
  sizes: ProductSize[];
  value: string | null;
  onChange: (size: string) => void;
  disabled?: boolean;
}

export function SizeSelector({ sizes, value, onChange, disabled }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((s) => {
        const out = s.stock <= 0;
        const active = value === s.size;
        return (
          <button
            key={s.size}
            type="button"
            disabled={disabled || out}
            onClick={() => onChange(s.size)}
            className={`min-w-[44px] rounded-lg border px-3 py-2 font-jost text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              out
                ? "cursor-not-allowed border-brand-border text-brand-dimmed line-through opacity-50"
                : active
                  ? "border-brand-pink bg-brand-pink-muted text-brand-text"
                  : "border-brand-border text-brand-text hover:border-brand-pink"
            }`}
          >
            {s.size}
          </button>
        );
      })}
    </div>
  );
}
