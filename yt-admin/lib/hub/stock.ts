/** sizes JSON: [{ "size": "S", "stock": 3 }, ...] */
export function countLowStockSkus(
  products: { sizes: unknown; is_published: boolean }[],
  threshold = 3,
): number {
  let count = 0;
  for (const p of products) {
    if (!p.is_published) continue;
    const rows = parseSizes(p.sizes);
    for (const row of rows) {
      const n = row.stock;
      if (typeof n === "number" && n >= 0 && n <= threshold) count += 1;
    }
  }
  return count;
}

function parseSizes(raw: unknown): { stock?: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x) => x && typeof x === "object") as { stock?: number }[];
}

export function minStockLabel(sizes: unknown): string | null {
  const rows = parseSizes(sizes);
  let min: number | null = null;
  for (const row of rows) {
    if (typeof row.stock !== "number") continue;
    if (min === null || row.stock < min) min = row.stock;
  }
  if (min === null) return null;
  return min <= 3 ? `${min} (low)` : `${min}`;
}
