"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  AnalyticsIcon,
  CategoryIcon,
  CloseIcon,
  CustomersIcon,
  DashboardIcon,
  ExpensesIcon,
  InventoryIcon,
  OrdersIcon,
  OwnerIcon,
  ReportsIcon,
  RidersIcon,
  RunwayInspoIcon,
  SettingsIcon,
  StorefrontIcon,
  TeamIcon,
} from "@/components/hub/HubIcons";
import { useMobileSidebar } from "@/components/hub/MobileSidebarContext";

/** Keep literal union here so this client chunk does not depend on @/lib/hub-role runtime resolution. */
export type HubSidebarRole = "admin" | "owner";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type NavItem = { href: string; label: string; icon: IconType };

const boutiqueNav: readonly NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/dashboard/orders", label: "Orders", icon: OrdersIcon },
  { href: "/dashboard/products", label: "Inventory", icon: InventoryIcon },
  { href: "/dashboard/categories", label: "Category", icon: CategoryIcon },
  { href: "/dashboard/customers", label: "Customers", icon: CustomersIcon },
  { href: "/dashboard/expenses", label: "Expenses", icon: ExpensesIcon },
  { href: "/dashboard/riders", label: "Riders", icon: RidersIcon },
  { href: "/dashboard/owner/reports", label: "Analytics", icon: AnalyticsIcon },
] as const;

const ownerNav: readonly NavItem[] = [
  { href: "/dashboard/owner", label: "Owner overview", icon: OwnerIcon },
  { href: "/dashboard/owner/reports", label: "Reports & margins", icon: ReportsIcon },
  { href: "/dashboard/owner/payment-intents", label: "Payment intents", icon: AnalyticsIcon },
  { href: "/dashboard/owner/runway-inspo", label: "Runway inspo", icon: RunwayInspoIcon },
  { href: "/dashboard/owner/access", label: "Team & access", icon: TeamIcon },
  { href: "/dashboard/settings", label: "Shop settings", icon: SettingsIcon },
] as const;

export default function HubSidebar({ role }: { role: HubSidebarRole }) {
  const pathname = usePathname() ?? "/dashboard";
  const { isOpen, close } = useMobileSidebar();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const linkCls = (href: string) =>
    isActive(href)
      ? "bg-rose-500/15 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100"
      : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800";

  const iconCls = (href: string) =>
    isActive(href)
      ? "h-5 w-5 shrink-0 text-rose-700 dark:text-rose-200"
      : "h-5 w-5 shrink-0 text-stone-500 group-hover:text-stone-700 dark:text-stone-500 dark:group-hover:text-stone-200";

  return (
    <>
      {/* Mobile/tablet backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-stone-900/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden print:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
        onClick={close}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-stone-200 bg-[#fdf8fa] transition-transform duration-200 lg:w-56 lg:translate-x-0 print:hidden dark:border-stone-800 dark:bg-stone-950 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        }`}
        aria-label="Primary navigation"
      >
        <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-800">
          <div>
            <p className="font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              Yanney Trends
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {role === "owner" ? "Owner" : "Admin"}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 lg:hidden dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            aria-label="Close navigation"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Boutique
          </p>
          {boutiqueNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${linkCls(item.href)}`}
              >
                <Icon className={iconCls(item.href)} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {role === "owner" ? (
            <>
              <p className="mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Owner
              </p>
              {ownerNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${linkCls(item.href)}`}
                  >
                    <Icon className={iconCls(item.href)} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </>
          ) : null}
        </nav>

        <div className="border-t border-stone-200 p-3 dark:border-stone-800">
          <a
            href={process.env.NEXT_PUBLIC_SHOP_URL ?? "http://localhost:3003"}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            <StorefrontIcon className="h-5 w-5 shrink-0 text-stone-500 group-hover:text-stone-700 dark:text-stone-500 dark:group-hover:text-stone-200" />
            <span className="truncate">View storefront →</span>
          </a>
        </div>
      </aside>
    </>
  );
}
