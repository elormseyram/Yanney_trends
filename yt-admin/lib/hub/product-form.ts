export function parseColorList(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function optionalPositiveInt(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

export const DRESS_OCCASIONS = ["", "CASUAL", "DINNER", "EVENING", "BOTH"] as const;
