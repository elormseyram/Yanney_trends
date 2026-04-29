"use client";

import { colorLabelToHex, colorLabelToStyle } from "@/lib/colorSwatch";

export function ColorSwatchDot({
  label,
  size = "md",
  className = "",
}: {
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const hex = colorLabelToHex(label);
  const isLight = hex === "#ffffff" || hex === "#faf8f5" || hex === "#f4f0e6" || hex === "#f5f0e4";

  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-block shrink-0 rounded-full border shadow-inner ${dim} ${
        isLight ? "border-stone-300 dark:border-stone-500" : "border-black/15 dark:border-white/25"
      } ${className}`}
      style={colorLabelToStyle(label)}
    />
  );
}
