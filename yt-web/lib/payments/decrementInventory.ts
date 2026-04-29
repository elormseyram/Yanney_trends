import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

type SizeRow = { size: string; stock: number };

function parseSizes(raw: unknown): SizeRow[] {
  if (!Array.isArray(raw)) return [];
  const out: SizeRow[] = [];
  for (const row of raw) {
    if (row && typeof row === "object" && "size" in row) {
      const o = row as { size: unknown; stock?: unknown };
      out.push({
        size: String(o.size ?? "").trim() || "ONE",
        stock: Math.max(0, Math.round(Number(o.stock ?? 0))),
      });
    }
  }
  return out.length ? out : [{ size: "ONE", stock: 0 }];
}

function normalizeSizeKey(s: string): string {
  return s.trim().toLowerCase();
}

function stripSizeNoise(s: string): string {
  return normalizeSizeKey(s).replace(/[^a-z0-9]/g, "");
}

/** Match order line size to hub SKU row (trim + case-insensitive + alphanumeric fallback). */
function findSizeIndex(sizes: SizeRow[], orderSize: string): number {
  const k = normalizeSizeKey(orderSize || "ONE");
  const kCompact = stripSizeNoise(orderSize || "ONE");
  let idx = sizes.findIndex((s) => normalizeSizeKey(s.size) === k);
  if (idx >= 0) return idx;
  if (kCompact.length > 0) {
    idx = sizes.findIndex((s) => stripSizeNoise(s.size) === kCompact);
    if (idx >= 0) return idx;
  }
  return -1;
}

function extractMissingColumn(message: string): string | null {
  if (!message) return null;
  const m1 = /column\s+"([^"]+)"[^]*does not exist/i.exec(message);
  if (m1?.[1]) return m1[1];
  const m2 = /Could not find the ['"]([^'"]+)['"] column/i.exec(message);
  if (m2?.[1]) return m2[1];
  return null;
}

async function updateProductPatch(
  admin: AdminClient,
  productId: string,
  patch: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  let row: Record<string, unknown> = { ...patch };
  for (let attempt = 0; attempt < 8; attempt++) {
    const { error } = await admin.from("products").update(row).eq("id", productId);
    if (!error) return { ok: true as const };
    const missing = extractMissingColumn(error.message);
    if (!missing || !(missing in row)) return { ok: false as const, message: error.message };
    const next = { ...row };
    delete next[missing];
    row = next;
  }
  return { ok: false as const, message: "Could not update product after column retries." };
}

/**
 * Decrements per-size stock for each paid line item. Keeps `total_stock_units` aligned with the sum
 * of `sizes[].stock`. Sets is_published=false when total hits 0.
 */
export async function decrementInventoryForOrderItems(
  admin: AdminClient,
  items: unknown[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!Array.isArray(items)) return { ok: true };

  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const productId = String(row.product_id ?? row.productId ?? "").trim();
    if (!productId) continue;
    const sizeKey = String(row.size ?? "ONE").trim() || "ONE";
    const qty = Math.max(1, Math.round(Number(row.quantity ?? row.qty ?? 1) || 1));

    const { data: product, error } = await admin
      .from("products")
      .select("id, sizes, is_published, total_stock_units")
      .eq("id", productId)
      .maybeSingle();
    if (error) return { ok: false, message: error.message };
    if (!product) continue;

    const sizes = parseSizes((product as { sizes?: unknown }).sizes);
    const idx = findSizeIndex(sizes, sizeKey);
    if (idx < 0) {
      // eslint-disable-next-line no-console
      console.warn(
        "[decrementInventory] No size row for product",
        productId,
        "order size:",
        sizeKey,
        "hub sizes:",
        sizes.map((s) => s.size),
      );
      continue;
    }

    const next = sizes.map((s, i) =>
      i === idx ? { ...s, stock: Math.max(0, s.stock - qty) } : { ...s },
    );
    const totalStock = next.reduce((sum, s) => sum + s.stock, 0);
    const patch: Record<string, unknown> = {
      sizes: next,
      total_stock_units: totalStock,
      updated_at: new Date().toISOString(),
    };
    if (totalStock <= 0) {
      patch.is_published = false;
    }

    const up = await updateProductPatch(admin, productId, patch);
    if (!up.ok) return up;
  }

  return { ok: true };
}
