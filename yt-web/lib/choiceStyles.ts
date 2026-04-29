/**
 * Shared button / chip / CTA styles. All variants use the design-token
 * CSS variables defined in `globals.css`, so they flip light/dark
 * automatically without needing per-call `dark:` overrides.
 */

export const choice = {
  /** Full quiz / radio option */
  btn: (active: boolean) =>
    `rounded-lg border px-4 py-3 text-left font-jost text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-pink/25 ${
      active
        ? "border-brand-pink bg-[var(--surface-tint)] text-[var(--ink-strong)] shadow-[inset_0_0_0_1px_rgba(255,46,136,0.12)]"
        : "border-[var(--border-pink)] bg-[var(--surface-card)] text-[var(--ink-muted)] hover:border-brand-pink/50"
    }`,

  /** Compact chip (tags, small toggles) */
  chip: (active: boolean) =>
    `rounded-lg border px-3 py-2 text-left font-jost text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-pink/25 ${
      active
        ? "border-brand-pink bg-[var(--surface-tint)] text-[var(--ink-strong)]"
        : "border-[var(--border-pink)] bg-[var(--surface-card)] text-[var(--ink-muted)] hover:border-brand-pink/50"
    }`,

  /** Primary CTA — soft outline, brand pink hover */
  cta: "rounded-lg border border-brand-pink bg-[var(--surface-card-soft)] px-4 py-2.5 font-jost text-sm font-semibold text-[var(--ink-strong)] transition-colors hover:bg-brand-pink-muted",

  /** Solid primary CTA — strong pink, white ink */
  ctaSolid:
    "rounded-lg bg-brand-pink px-4 py-2.5 font-jost text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-pink-hover disabled:cursor-not-allowed disabled:opacity-60",
} as const;
