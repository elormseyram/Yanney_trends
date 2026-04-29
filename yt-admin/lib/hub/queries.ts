import { createClient } from "@/lib/supabase/server";
import { OPEN_ORDER_STATUSES } from "@/lib/hub/constants";
import { buildOwnerSnapshot, type OwnerChartSnapshot } from "@/lib/hub/ownerSnapshot";
import { countLowStockSkus } from "@/lib/hub/stock";
import type {
  FrequentCustomer,
  HubOrderDetail,
  HubOrderListRow,
  HubProductRow,
  HubProfileRow,
  HubRiderRow,
  ProductCategoryRow,
  RunwayOutfitPostRow,
  ShopSettingsRow,
} from "@/lib/hub/types";

export type HubQueryError = { ok: false; message: string };
export type HubQueryOk<T> = { ok: true; data: T };

function err(e: unknown): HubQueryError {
  const message = e instanceof Error ? e.message : "Unknown error";
  return { ok: false, message };
}

export async function fetchOverviewStats(): Promise<
  HubQueryOk<{
    totalOrders: number;
    totalInventoryUnits: number;
    openOrders: number;
    pendingOrders: number;
    completedOrders: number;
    paidOrders30d: number;
    revenue30d: number;
    lowStockSkus: number;
    newProfiles30d: number;
    currency: string;
    ordersSeries7d: number[];
    revenueSeries7d: number[];
  }> | HubQueryError
> {
  try {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const iso = thirtyDaysAgo.toISOString();

    const totalQ = supabase.from("orders").select("id", { count: "exact", head: true });
    const openQ = supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", OPEN_ORDER_STATUSES);
    const statusQ = supabase
      .from("orders")
      .select("status, payment_status, created_at, total, currency")
      .gte("created_at", iso)
      .limit(5000);
    const paidQ = supabase
      .from("orders")
      .select("total, currency, payment_status")
      .eq("payment_status", "PAID")
      .gte("created_at", iso);

    const [totalRes, openRes, statusRes, paidRes, productsRes] = await Promise.all([
      totalQ,
      openQ,
      statusQ,
      paidQ,
      supabase.from("products").select("sizes, is_published"),
    ]);

    const profilesPrimary = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", iso);
    const profilesRes =
      profilesPrimary.error && isMissingColumnError(profilesPrimary.error.message)
        ? await supabase.from("profiles").select("id", { count: "exact", head: true })
        : profilesPrimary;

    if (totalRes.error) return { ok: false, message: totalRes.error.message };
    if (openRes.error) return { ok: false, message: openRes.error.message };
    if (statusRes.error) return { ok: false, message: statusRes.error.message };
    if (paidRes.error) return { ok: false, message: paidRes.error.message };
    if (productsRes.error) return { ok: false, message: productsRes.error.message };
    if (profilesRes.error) return { ok: false, message: profilesRes.error.message };

    const paidRows = (paidRes.data ?? []) as { total: number; currency: string | null }[];
    const revenue30d = paidRows.reduce((s, r) => s + Number(r.total ?? 0), 0);
    const currency = paidRows.find((r) => r.currency)?.currency ?? "GHS";
    const paidOrders30d = paidRows.length;

    const lowStockSkus = countLowStockSkus(productsRes.data ?? [], 3);
    const totalInventoryUnits = (productsRes.data ?? []).reduce((sum, p) => {
      const row = p as { sizes?: unknown; is_published?: boolean };
      if (!row.is_published) return sum;
      const sizes = Array.isArray(row.sizes) ? (row.sizes as Record<string, unknown>[]) : [];
      const total = sizes.reduce((s, sz) => s + Number(sz.stock ?? 0), 0);
      return sum + (Number.isFinite(total) ? total : 0);
    }, 0);
    const statuses = (statusRes.data ?? []) as {
      status: string | null;
      payment_status: string | null;
      created_at: string | null;
      total: number | null;
      currency: string | null;
    }[];
    const pendingOrders = statuses.filter((r) => (r.status ?? "") === "PENDING").length;
    const completedOrders = statuses.filter((r) =>
      ["DELIVERED", "COLLECTED"].includes((r.status ?? "").toUpperCase()),
    ).length;

    const today = new Date();
    const ordersSeries7d = Array.from({ length: 7 }, (_, i) => {
      const d0 = new Date(today);
      d0.setHours(0, 0, 0, 0);
      d0.setDate(d0.getDate() - (6 - i));
      const d1 = new Date(d0);
      d1.setDate(d1.getDate() + 1);
      return statuses.filter((r) => {
        if (!r.created_at) return false;
        const d = new Date(r.created_at);
        return d >= d0 && d < d1;
      }).length;
    });

    const revenueSeries7d = Array.from({ length: 7 }, (_, i) => {
      const d0 = new Date(today);
      d0.setHours(0, 0, 0, 0);
      d0.setDate(d0.getDate() - (6 - i));
      const d1 = new Date(d0);
      d1.setDate(d1.getDate() + 1);
      return statuses
        .filter((r) => {
          if (!r.created_at) return false;
          if ((r.payment_status ?? "").toUpperCase() !== "PAID") return false;
          const d = new Date(r.created_at);
          return d >= d0 && d < d1;
        })
        .reduce((sum, r) => sum + Number(r.total ?? 0), 0);
    });

    return {
      ok: true,
      data: {
        totalOrders: totalRes.count ?? 0,
        totalInventoryUnits,
        openOrders: openRes.count ?? 0,
        pendingOrders,
        completedOrders,
        paidOrders30d,
        revenue30d,
        lowStockSkus,
        newProfiles30d: profilesRes.count ?? 0,
        currency,
        ordersSeries7d,
        revenueSeries7d,
      },
    };
  } catch (e) {
    return err(e);
  }
}

const ORDERS_BASE_COLUMNS =
  "id, order_number, customer_name, customer_email, status, total, currency, payment_status, created_at, fulfillment_type, is_gift_order, delivery_rider_id";

const ORDERS_SCHEDULE_COLUMNS = "scheduled_date, scheduled_slot, schedule_status";

function isMissingColumnError(message: string): boolean {
  return /column[\s\S]+does not exist/i.test(message);
}

export async function fetchOrdersList(): Promise<HubQueryOk<HubOrderListRow[]> | HubQueryError> {
  try {
    const supabase = await createClient();

    /* Try the full query first; if the schedule columns aren't in the DB yet
     * (older schema), gracefully fall back so the orders list still works. */
    const fullSelect = `${ORDERS_BASE_COLUMNS}, ${ORDERS_SCHEDULE_COLUMNS}`;
    const primary = await supabase
      .from("orders")
      .select(fullSelect)
      .order("created_at", { ascending: false })
      .limit(150);

    let data: unknown = primary.data;
    let error = primary.error;

    if (error && isMissingColumnError(error.message)) {
      const fallback = await supabase
        .from("orders")
        .select(ORDERS_BASE_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(150);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return { ok: false, message: error.message };

    const rawRows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
    const rows: HubOrderListRow[] = rawRows.map((r) => ({
      ...(r as object),
      scheduled_date: (r.scheduled_date as string | null | undefined) ?? null,
      scheduled_slot: (r.scheduled_slot as string | null | undefined) ?? null,
      schedule_status: (r.schedule_status as HubOrderListRow["schedule_status"]) ?? null,
    } as HubOrderListRow));

    const riderIds = [...new Set(rows.map((r) => r.delivery_rider_id).filter(Boolean))] as string[];
    let nameById = new Map<string, string>();
    if (riderIds.length > 0) {
      const { data: riders, error: rErr } = await supabase
        .from("delivery_riders")
        .select("id, display_name")
        .in("id", riderIds);
      if (!rErr && riders?.length) {
        nameById = new Map(riders.map((x) => [x.id as string, x.display_name as string]));
      }
    }
    const enriched = rows.map((o) => ({
      ...o,
      rider_display_name: o.delivery_rider_id ? (nameById.get(o.delivery_rider_id) ?? null) : null,
    }));
    return { ok: true, data: enriched };
  } catch (e) {
    return err(e);
  }
}

export async function fetchOrderById(
  id: string,
): Promise<HubQueryOk<HubOrderDetail> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();

    if (error) return { ok: false, message: error.message };
    if (!data) return { ok: false, message: "Order not found" };
    const order = data as HubOrderDetail & { delivery_rider_id?: string | null };
    let rider: HubOrderDetail["rider"] = null;
    if (order.delivery_rider_id) {
      const { data: r } = await supabase
        .from("delivery_riders")
        .select("id, display_name, phone")
        .eq("id", order.delivery_rider_id)
        .maybeSingle();
      if (r) {
        rider = {
          id: r.id as string,
          display_name: r.display_name as string,
          phone: (r.phone as string | null) ?? null,
        };
      }
    }
    return { ok: true, data: { ...order, rider } };
  } catch (e) {
    return err(e);
  }
}

export async function fetchRidersList(activeOnly = false): Promise<HubQueryOk<HubRiderRow[]> | HubQueryError> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("delivery_riders")
      .select("id, display_name, phone, vehicle_note, notes, is_active, created_at")
      .order("display_name", { ascending: true });
    if (activeOnly) q = q.eq("is_active", true);
    const { data, error } = await q;

    if (error) return { ok: false, message: error.message };
    return { ok: true, data: (data ?? []) as HubRiderRow[] };
  } catch (e) {
    return err(e);
  }
}

export type RiderOrderExportRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string | null;
  items: unknown;
  total: number;
  currency: string;
  status: string;
  payment_status: string;
  fulfillment_type: string;
  created_at: string;
  scheduled_date: string | null;
  scheduled_slot: string | null;
};

export async function fetchRiderOrdersDetailed(
  riderId: string,
): Promise<HubQueryOk<RiderOrderExportRow[]> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_phone, customer_email, delivery_address, items, total, currency, status, payment_status, fulfillment_type, created_at, scheduled_date, scheduled_slot",
      )
      .eq("delivery_rider_id", riderId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) return { ok: false, message: error.message };
    return { ok: true, data: (data ?? []) as RiderOrderExportRow[] };
  } catch (e) {
    return err(e);
  }
}

export async function fetchProductsList(): Promise<HubQueryOk<HubProductRow[]> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, card_subtitle, category, price, sale_price, is_published, sizes, colors, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(200);

    if (error) return { ok: false, message: error.message };
    return { ok: true, data: (data ?? []) as HubProductRow[] };
  } catch (e) {
    return err(e);
  }
}

export async function fetchProductById(
  id: string,
): Promise<HubQueryOk<Record<string, unknown>> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

    if (error) return { ok: false, message: error.message };
    if (!data) return { ok: false, message: "Product not found" };
    return { ok: true, data };
  } catch (e) {
    return err(e);
  }
}

export async function fetchProfilesList(): Promise<HubQueryOk<HubProfileRow[]> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return { ok: false, message: error.message };
    return { ok: true, data: (data ?? []) as HubProfileRow[] };
  } catch (e) {
    return err(e);
  }
}

export type OrderContactRow = {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  last_order_at: string;
};

export async function fetchRecentOrderContacts(): Promise<
  HubQueryOk<OrderContactRow[]> | HubQueryError
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("customer_name, customer_email, customer_phone, created_at")
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) return { ok: false, message: error.message };

    const rows = (data ?? []) as {
      customer_name: string;
      customer_email: string | null;
      customer_phone: string;
      created_at: string;
    }[];

    const map = new Map<string, OrderContactRow>();
    for (const r of rows) {
      const key = (r.customer_email ?? "").trim() || r.customer_phone || r.customer_name;
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, {
          customer_name: r.customer_name,
          customer_email: r.customer_email,
          customer_phone: r.customer_phone,
          last_order_at: r.created_at,
        });
      }
    }

    return { ok: true, data: Array.from(map.values()).slice(0, 40) };
  } catch (e) {
    return err(e);
  }
}

export async function fetchShopSettings(): Promise<HubQueryOk<ShopSettingsRow | null> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("shop_settings").select("*").limit(1).maybeSingle();

    if (error) return { ok: false, message: error.message };
    return { ok: true, data: data as ShopSettingsRow | null };
  } catch (e) {
    return err(e);
  }
}

export async function fetchRunwayOutfitPosts(): Promise<HubQueryOk<RunwayOutfitPostRow[]> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("runway_outfit_posts")
      .select("id, title, subtitle, hero_image_url, product_ids, bundle_price_ghs, sort_order, is_published, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return { ok: false, message: error.message };
    const rows = (data ?? []).map((r) => {
      const raw = r as Record<string, unknown>;
      const ids = Array.isArray(raw.product_ids)
        ? (raw.product_ids as unknown[]).map((x) => String(x))
        : [];
      return {
        ...raw,
        product_ids: ids,
      } as RunwayOutfitPostRow;
    });
    return { ok: true, data: rows };
  } catch (e) {
    return err(e);
  }
}

export async function fetchProductCategories(
  visibleOnly = false,
): Promise<HubQueryOk<ProductCategoryRow[]> | HubQueryError> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("product_categories")
      .select("slug, label, description, image_url, sort_order, is_visible, created_at, updated_at")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true });
    if (visibleOnly) q = q.eq("is_visible", true);
    const { data, error } = await q;

    if (error) return { ok: false, message: error.message };
    return { ok: true, data: (data ?? []) as ProductCategoryRow[] };
  } catch (e) {
    return err(e);
  }
}

/** Distinct customers who placed at least `threshold` orders, ordered by frequency. */
export async function fetchFrequentCustomers(
  threshold = 7,
): Promise<HubQueryOk<FrequentCustomer[]> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("customer_name, customer_email, customer_phone, total, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) return { ok: false, message: error.message };

    type RawRow = {
      customer_name: string;
      customer_email: string | null;
      customer_phone: string;
      total: unknown;
      currency: string | null;
      created_at: string;
    };
    const rows = (data ?? []) as RawRow[];
    const map = new Map<string, FrequentCustomer>();
    for (const r of rows) {
      const emailKey = (r.customer_email ?? "").trim().toLowerCase();
      const phoneKey = (r.customer_phone ?? "").trim();
      const key = emailKey || phoneKey || (r.customer_name ?? "").trim();
      if (!key) continue;
      const totalNum = Number(r.total ?? 0);
      const existing = map.get(key);
      if (existing) {
        existing.order_count += 1;
        existing.total_spent += Number.isFinite(totalNum) ? totalNum : 0;
        if (new Date(r.created_at) > new Date(existing.last_order_at)) {
          existing.last_order_at = r.created_at;
          existing.customer_name = r.customer_name || existing.customer_name;
          existing.customer_email = r.customer_email ?? existing.customer_email;
          existing.customer_phone = r.customer_phone || existing.customer_phone;
        }
      } else {
        map.set(key, {
          customer_name: r.customer_name,
          customer_email: r.customer_email,
          customer_phone: r.customer_phone,
          order_count: 1,
          total_spent: Number.isFinite(totalNum) ? totalNum : 0,
          currency: r.currency ?? "GHS",
          last_order_at: r.created_at,
        });
      }
    }

    const out = Array.from(map.values())
      .filter((c) => c.order_count >= threshold)
      .sort((a, b) => b.order_count - a.order_count || b.total_spent - a.total_spent);

    return { ok: true, data: out };
  } catch (e) {
    return err(e);
  }
}

export type HubExpenseRow = {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  incurred_on: string;
  vendor: string | null;
  notes: string | null;
  created_at: string;
};

export type HubPaymentIntentRow = {
  reference: string;
  amount_pesewas: number;
  currency: string;
  customer_email: string | null;
  status: string;
  paystack_reference: string | null;
  paid_at: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchPaymentIntents(
  limit = 200,
): Promise<HubQueryOk<HubPaymentIntentRow[]> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("checkout_payment_intents")
      .select(
        "reference, amount_pesewas, currency, customer_email, status, paystack_reference, paid_at, converted_at, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(limit, 500)));

    if (error) return { ok: false, message: error.message };
    return { ok: true, data: (data ?? []) as HubPaymentIntentRow[] };
  } catch (e) {
    return err(e);
  }
}

export async function fetchExpensesList(): Promise<HubQueryOk<HubExpenseRow[]> | HubQueryError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hub_expenses")
      .select("id, title, category, amount, currency, incurred_on, vendor, notes, created_at")
      .order("incurred_on", { ascending: false })
      .limit(200);

    if (error) return { ok: false, message: error.message };
    return { ok: true, data: (data ?? []) as HubExpenseRow[] };
  } catch (e) {
    return err(e);
  }
}

/** Last 30 days: paid sales, order mix, logged expenses — for owner charts. */
export async function fetchOwnerChartSnapshot(): Promise<
  HubQueryOk<OwnerChartSnapshot> | HubQueryError
> {
  try {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const iso = thirtyDaysAgo.toISOString();
    const incurredFrom = iso.slice(0, 10);

    const [paidRes, statusRes, expRes] = await Promise.all([
      supabase
        .from("orders")
        .select("total, currency, created_at")
        .eq("payment_status", "PAID")
        .gte("created_at", iso),
      supabase.from("orders").select("status").gte("created_at", iso).limit(5000),
      supabase
        .from("hub_expenses")
        .select("amount, category, incurred_on")
        .gte("incurred_on", incurredFrom),
    ]);

    if (paidRes.error) return { ok: false, message: paidRes.error.message };
    if (statusRes.error) return { ok: false, message: statusRes.error.message };

    const expenseRows = expRes.error
      ? []
      : ((expRes.data ?? []) as { amount: unknown; category: string; incurred_on: string }[]);

    const snapshot = buildOwnerSnapshot(
      (paidRes.data ?? []) as { total: unknown; currency: string | null; created_at: string }[],
      (statusRes.data ?? []) as { status: string }[],
      expenseRows,
    );
    return { ok: true, data: snapshot };
  } catch (e) {
    return err(e);
  }
}
