"use client";

import type { OwnerChartSnapshot } from "@/lib/hub/ownerSnapshot";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#e11d48", "#78716c", "#a8a29e", "#fca5a5", "#57534e", "#44403c", "#9f1239", "#57534e"];

function moneyFmt(currency: string) {
  try {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 0 });
  } catch {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 });
  }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PACKAGED: "Packed",
  RIDER_ASSIGNED: "Rider assigned",
  OUT_FOR_DELIVERY: "Out for delivery",
  READY_FOR_PICKUP: "Ready for pickup",
  DELIVERED: "Delivered",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

function statusLabel(key: string) {
  return STATUS_LABELS[key] ?? key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = { snapshot: OwnerChartSnapshot; variant: "overview" | "reports" };

export function OwnerAnalyticsCharts({ snapshot, variant }: Props) {
  const fmt = moneyFmt(snapshot.currency);
  const dailyChart = snapshot.daily;
  const statusData = snapshot.orderStatusCounts.map((s) => ({
    name: statusLabel(s.key),
    count: s.count,
  }));
  const expensePie = snapshot.expenseByCategory.map((e) => ({
    name: e.category,
    value: e.amount,
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Paid sales (30 days)"
          value={fmt.format(snapshot.paidRevenue30d)}
          hint="Completed payments only"
        />
        <KpiCard title="Paid orders" value={String(snapshot.paidOrderCount30d)} hint="Last 30 days" />
        <KpiCard title="Expenses logged" value={fmt.format(snapshot.expenses30d)} hint="What you entered under Expenses" />
        <KpiCard
          title="Simple balance"
          value={fmt.format(snapshot.simpleBalance30d)}
          hint="Paid sales minus logged expenses — informal, not full accounts"
        />
      </div>

      {variant === "overview" ? (
        <>
          <section className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900 sm:p-5">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Daily paid sales</h2>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Each day in the last 30 days</p>
            <div className="mt-4 h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ownerRevFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e11d48" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmt.format(Number(v))} width={72} />
                  <Tooltip
                    formatter={(value) => [
                      fmt.format(typeof value === "number" ? value : Number(value) || 0),
                      "Paid sales",
                    ]}
                    labelFormatter={(_, p) => (p?.[0]?.payload?.dayKey as string) ?? ""}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#be123c"
                    strokeWidth={2}
                    fill="url(#ownerRevFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900 sm:p-5">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Orders by stage</h2>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">All orders placed in the last 30 days</p>
            <div className="mt-4 h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-700" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Orders" fill="#78716c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      ) : null}

      {variant === "reports" ? (
        <>
          <section className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900 sm:p-5">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Paid orders per day</h2>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">How many completed payments each day</p>
            <div className="mt-4 h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={36} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="orderCount" name="Orders" fill="#be123c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900 sm:p-5">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Expenses by category</h2>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Last 30 days from your expense log</p>
              {expensePie.length === 0 ? (
                <p className="mt-8 text-center text-sm text-stone-500">No expenses in this window yet.</p>
              ) : (
                <div className="mt-2 h-[280px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                        }
                      >
                        {expensePie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          fmt.format(typeof value === "number" ? value : Number(value) || 0)
                        }
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900 sm:p-5">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Order mix</h2>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Share of each stage (30 days)</p>
              {statusData.length === 0 ? (
                <p className="mt-8 text-center text-sm text-stone-500">No orders in this window yet.</p>
              ) : (
                <div className="mt-2 h-[280px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                        }
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            Margins need cost per piece; for now this view shows paid sales, counts, and what you have logged as spend.
            Use the totals above as a quick pulse, not tax advice.
          </p>
        </>
      ) : null}
    </div>
  );
}

function KpiCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">{title}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">{value}</p>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{hint}</p>
    </div>
  );
}
