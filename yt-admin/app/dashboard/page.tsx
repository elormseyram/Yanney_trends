import { getHubRole } from "@/lib/hub-auth";
import { fetchOverviewStats } from "@/lib/hub/queries";
import { formatMoney } from "@/lib/hub/format";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { OverviewShortcuts } from "@/components/hub/OverviewShortcuts";
import { FormFlash } from "@/components/hub/FormFlash";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

function CardIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} />;
}

function PendingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <CardIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </CardIcon>
  );
}

function CompletedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <CardIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2 2 5-5" />
    </CardIcon>
  );
}

function RevenueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <CardIcon {...props}>
      <path d="M4 20h16" />
      <path d="M7 15v3M12 11v7M17 7v11" />
    </CardIcon>
  );
}

function QueueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <CardIcon {...props}>
      <path d="M5 7h14" />
      <path d="M5 12h10" />
      <path d="M5 17h8" />
    </CardIcon>
  );
}

function InventoryIconSmall(props: SVGProps<SVGSVGElement>) {
  return (
    <CardIcon {...props}>
      <path d="M4 8h16v11H4z" />
      <path d="M9 8V5h6v3" />
    </CardIcon>
  );
}

function OrdersIconSmall(props: SVGProps<SVGSVGElement>) {
  return (
    <CardIcon {...props}>
      <path d="M5 7h14l-1.2 11H6.2L5 7Z" />
      <path d="M9 7V5a3 3 0 1 1 6 0v2" />
    </CardIcon>
  );
}

function SparkBars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values.map((v) => Number(v || 0)));
  return (
    <div className="mt-3 flex h-10 items-end gap-1.5">
      {values.map((v, idx) => {
        const h = Math.max(10, Math.round((Number(v || 0) / max) * 100));
        return (
          <span
            key={idx}
            className="w-2 rounded-full bg-rose-300/90 dark:bg-rose-400/70"
            style={{ height: `${h}%` }}
            title={String(v)}
          />
        );
      })}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  Icon,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: IconType;
}) {
  return (
    <article className="h-[124px] rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">{label}</p>
        <Icon className="h-4 w-4 text-rose-500/80" />
      </div>
      <p className="mt-2 text-xl font-semibold leading-none text-stone-900 dark:text-stone-100">{value}</p>
      <p className="mt-2 text-[11px] text-stone-500 dark:text-stone-400">{sub}</p>
    </article>
  );
}

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;
  const flash = await searchParams;

  const stats = await fetchOverviewStats();
  const openOrders = stats.ok ? stats.data.openOrders : 0;
  const totalOrders = stats.ok ? stats.data.totalOrders : 0;
  const totalInventoryUnits = stats.ok ? stats.data.totalInventoryUnits : 0;
  const pendingOrders = stats.ok ? stats.data.pendingOrders : 0;
  const completedOrders = stats.ok ? stats.data.completedOrders : 0;
  const paidOrders30d = stats.ok ? stats.data.paidOrders30d : 0;
  const lowStock = stats.ok ? stats.data.lowStockSkus : 0;
  const newProfiles = stats.ok ? stats.data.newProfiles30d : 0;
  const revenue30d = stats.ok ? stats.data.revenue30d : 0;
  const currency = stats.ok ? stats.data.currency : "GHS";
  const ordersSeries7d = stats.ok ? stats.data.ordersSeries7d : [0, 0, 0, 0, 0, 0, 0];
  const revenueSeries7d = stats.ok ? stats.data.revenueSeries7d : [0, 0, 0, 0, 0, 0, 0];

  return (
    <>
      <HubTopBar title="Dashboard" role={role} />
      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <FormFlash err={flash.err} />
        {!stats.ok ? <QueryErrorBanner message={stats.message} /> : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.ok ? (
            <>
              <MetricCard
                label="Total orders"
                value={String(totalOrders)}
                sub="All visible orders"
                Icon={OrdersIconSmall}
              />
              <MetricCard
                label="Total inventory"
                value={String(totalInventoryUnits)}
                sub="Published units in stock"
                Icon={InventoryIconSmall}
              />
              <MetricCard
                label="Pending orders"
                value={String(pendingOrders)}
                sub="Needs confirmation / processing"
                Icon={PendingIcon}
              />
              <MetricCard
                label="Completed orders"
                value={String(completedOrders)}
                sub="Delivered or collected"
                Icon={CompletedIcon}
              />
              <MetricCard
                label="Paid orders (30d)"
                value={String(paidOrders30d)}
                sub="Revenue-counted orders"
                Icon={QueueIcon}
              />
              <MetricCard
                label="Revenue (30d)"
                value={formatMoney(revenue30d, currency)}
                sub="Paid orders only"
                Icon={RevenueIcon}
              />
            </>
          ) : (
            <>
              {(
                [
                  "Total orders",
                  "Total inventory",
                  "Pending orders",
                  "Completed orders",
                  "Paid orders (30d)",
                  "Revenue (30d)",
                ] as const
              ).map(
                (label) => (
                  <MetricCard key={label} label={label} value="—" sub="Unavailable right now" Icon={QueueIcon} />
                ),
              )}
            </>
          )}
        </div>

        <section className="grid gap-3 lg:grid-cols-3">
          <article className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-900">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Orders trend (7d)
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">{openOrders} open now</p>
            <SparkBars values={ordersSeries7d} />
          </article>
          <article className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-900">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Revenue trend (7d)
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
              {formatMoney(revenue30d, currency)} in 30d
            </p>
            <SparkBars values={revenueSeries7d} />
          </article>
          <article className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-900">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Ops snapshot
            </p>
            <ul className="mt-3 space-y-2 text-xs text-stone-600 dark:text-stone-300">
              <li className="flex items-center justify-between">
                <span>Low stock SKU</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{lowStock}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>New customers (30d)</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{newProfiles}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Paid orders (30d)</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{paidOrders30d}</span>
              </li>
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Next actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/orders"
              className="rounded-lg border border-stone-200 px-3 py-3 text-sm text-stone-700 hover:border-rose-300 hover:text-rose-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-rose-500/40 dark:hover:text-rose-300"
            >
              Review open orders
            </Link>
            <Link
              href="/dashboard/products"
              className="rounded-lg border border-stone-200 px-3 py-3 text-sm text-stone-700 hover:border-rose-300 hover:text-rose-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-rose-500/40 dark:hover:text-rose-300"
            >
              Restock low inventory
            </Link>
            <Link
              href="/dashboard/expenses"
              className="rounded-lg border border-stone-200 px-3 py-3 text-sm text-stone-700 hover:border-rose-300 hover:text-rose-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-rose-500/40 dark:hover:text-rose-300"
            >
              Log today&apos;s expenses
            </Link>
            <Link
              href="/dashboard/owner/reports"
              className="rounded-lg border border-stone-200 px-3 py-3 text-sm text-stone-700 hover:border-rose-300 hover:text-rose-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-rose-500/40 dark:hover:text-rose-300"
            >
              Check owner reports
            </Link>
          </div>
        </section>

        <OverviewShortcuts role={role} />
      </main>
    </>
  );
}
