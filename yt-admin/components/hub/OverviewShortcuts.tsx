import Link from "next/link";
import type { HubRole } from "@/lib/hub-role";

const links: { href: string; label: string; sub: string }[] = [
  { href: "/dashboard/orders", label: "Orders", sub: "Queue & fulfilment" },
  { href: "/dashboard/products", label: "Products", sub: "Catalog & stock" },
  { href: "/dashboard/expenses", label: "Expenses", sub: "Admin spend" },
  { href: "/dashboard/riders", label: "Riders", sub: "Delivery & run sheets" },
];

export function OverviewShortcuts({ role }: { role: HubRole }) {
  const all =
    role === "owner"
      ? [
          ...links,
          { href: "/dashboard/settings", label: "Shop settings", sub: "Hours, fees, contact" },
        ]
      : links;

  return (
    <section className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-white via-[#fff8fb] to-rose-50/40 p-5 shadow-sm dark:border-stone-700 dark:from-stone-900 dark:via-stone-900 dark:to-rose-950/30">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-rose-500/90">
            Quick links
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Jump to the tools you use most
          </p>
        </div>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {all.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex flex-col rounded-xl border border-stone-200/80 bg-white/80 px-4 py-3 transition hover:border-rose-300/80 hover:bg-white hover:shadow-md dark:border-stone-600 dark:bg-stone-950/60 dark:hover:border-rose-500/40 dark:hover:bg-stone-900"
            >
              <span className="text-sm font-semibold text-stone-900 group-hover:text-rose-700 dark:text-stone-100 dark:group-hover:text-rose-300">
                {item.label}
                <span className="ml-1 inline-block translate-x-0 text-rose-400 transition group-hover:translate-x-0.5">
                  →
                </span>
              </span>
              <span className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{item.sub}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
