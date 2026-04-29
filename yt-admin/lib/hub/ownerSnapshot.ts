/** Shape built for owner charts (numbers only — labels added in UI). */

export type OwnerDailyPoint = {
  dayKey: string;
  /** Short label e.g. "Apr 2" */
  label: string;
  revenue: number;
  orderCount: number;
};

export type OwnerChartSnapshot = {
  currency: string;
  paidRevenue30d: number;
  paidOrderCount30d: number;
  expenses30d: number;
  /** Paid sales minus expenses you logged (not formal accounting). */
  simpleBalance30d: number;
  daily: OwnerDailyPoint[];
  orderStatusCounts: { key: string; count: number }[];
  expenseByCategory: { category: string; amount: number }[];
};

function padDays(dailyMap: Map<string, { revenue: number; orders: number }>, days = 30): OwnerDailyPoint[] {
  const out: OwnerDailyPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const bucket = dailyMap.get(key) ?? { revenue: 0, orders: 0 };
    const label = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    out.push({ dayKey: key, label, revenue: bucket.revenue, orderCount: bucket.orders });
  }
  return out;
}

/** All arrays are already limited to the reporting window (e.g. last 30 days). */
export function buildOwnerSnapshot(
  paidOrders: { total: unknown; currency: string | null; created_at: string }[],
  allOrdersStatus: { status: string }[],
  expenses: { amount: unknown; category: string; incurred_on: string }[],
): OwnerChartSnapshot {
  const currency = paidOrders.find((o) => o.currency)?.currency?.trim() || "GHS";

  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  let paidRevenue30d = 0;
  const paidOrderCount30d = paidOrders.length;

  for (const o of paidOrders) {
    const amt = Number(o.total ?? 0);
    paidRevenue30d += amt;
    const day = o.created_at.slice(0, 10);
    const cur = dailyMap.get(day) ?? { revenue: 0, orders: 0 };
    cur.revenue += amt;
    cur.orders += 1;
    dailyMap.set(day, cur);
  }

  const statusMap = new Map<string, number>();
  for (const o of allOrdersStatus) {
    statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
  }
  const orderStatusCounts = Array.from(statusMap.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

  let expenses30d = 0;
  const catMap = new Map<string, number>();
  for (const e of expenses) {
    const amt = Number(e.amount ?? 0);
    expenses30d += amt;
    const c = (e.category || "Other").trim() || "Other";
    catMap.set(c, (catMap.get(c) ?? 0) + amt);
  }
  const expenseByCategory = Array.from(catMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    currency,
    paidRevenue30d,
    paidOrderCount30d,
    expenses30d,
    simpleBalance30d: paidRevenue30d - expenses30d,
    daily: padDays(dailyMap, 30),
    orderStatusCounts,
    expenseByCategory,
  };
}
