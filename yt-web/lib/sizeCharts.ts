/** Display labels for size systems; cart still stores the product's canonical size value. */

export type SizeSystem = "LETTER" | "EU" | "US";

const LETTER_MAP: Record<string, { eu: string; us: string }> = {
  XXS: { eu: "30-32", us: "00-0" },
  XS: { eu: "32-34", us: "0-2" },
  S: { eu: "36-38", us: "4-6" },
  M: { eu: "40-42", us: "8-10" },
  L: { eu: "44-46", us: "12-14" },
  XL: { eu: "48-50", us: "16-18" },
  XXL: { eu: "52-54", us: "20-22" },
  ONE: { eu: "OS", us: "OS" },
};

/** Rough EU shoe → US women's */
const EU_SHOE_US: Record<string, string> = {
  "36": "5.5",
  "37": "6.5",
  "38": "7.5",
  "39": "8.5",
  "40": "9.5",
};

export function isNumericSize(size: string): boolean {
  return /^\d/.test(size.trim());
}

export function labelForSize(size: string, system: SizeSystem): string {
  const u = size.trim().toUpperCase();
  if (isNumericSize(u)) {
    if (system === "EU") return `EU ${u}`;
    if (system === "US") return `US ${EU_SHOE_US[u] ?? u}`;
    return u;
  }
  const m = LETTER_MAP[u];
  if (!m) return size;
  if (system === "LETTER") return u;
  if (system === "EU") return `EU ${m.eu}`;
  return `US ${m.us}`;
}

function expandNumericRange(s: string): string[] {
  if (s === "OS" || s.toUpperCase() === "OS") return ["OS"];
  const m = s.match(/^(\d+)\s*[–-]\s*(\d+)$/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    if (Number.isNaN(a) || Number.isNaN(b)) return [s];
    const out: string[] = [];
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.push(String(i));
    return out;
  }
  if (/^\d+$/.test(s.trim())) return [s.trim()];
  return [s];
}

/** Expand US display like "4-6" into discrete picks; odd codes stay one option. */
function expandUsRangeDisplay(s: string): string[] {
  const m = s.match(/^(\d+)\s*[–-]\s*(\d+)$/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    if (Number.isNaN(a) || Number.isNaN(b)) return [s];
    const out: string[] = [];
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.push(String(i));
    return out;
  }
  return [s];
}

export interface GranularSizeOption {
  label: string;
  /** Always the catalog / cart SKU (e.g. S, M, or 38). */
  canonical: string;
}

/** Exact selectable labels when user picks EU / US / LETTER (ranges fan out). */
export function getGranularSizeOptions(skuSize: string, system: SizeSystem): GranularSizeOption[] {
  const raw = skuSize.trim();
  const u = raw.toUpperCase();
  if (isNumericSize(raw)) {
    if (system === "EU") return [{ label: `EU ${raw}`, canonical: raw }];
    if (system === "US") return [{ label: `US ${EU_SHOE_US[raw] ?? raw}`, canonical: raw }];
    return [{ label: raw, canonical: raw }];
  }
  const m = LETTER_MAP[u];
  if (!m) return [{ label: labelForSize(raw, system), canonical: raw }];
  if (system === "LETTER") return [{ label: u, canonical: raw }];
  if (system === "EU") {
    const parts = expandNumericRange(m.eu);
    if (parts.length <= 1) return [{ label: `EU ${m.eu}`, canonical: raw }];
    return parts.map((n) => ({ label: `EU ${n}`, canonical: raw }));
  }
  const usParts = expandUsRangeDisplay(m.us);
  if (usParts.length <= 1) return [{ label: `US ${m.us}`, canonical: raw }];
  return usParts.map((n) => ({ label: `US ${n}`, canonical: raw }));
}
