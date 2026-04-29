import type { BodyDescription } from "@/lib/constants";

export type FitPreference = "fitted" | "regular" | "relaxed";

export interface SizeInputs {
  heightCm: number;
  fit: FitPreference;
  usualSize: string;
}

const ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL"] as const;

function normalizeSize(s: string): string {
  const u = s.trim().toUpperCase();
  if (ORDER.includes(u as (typeof ORDER)[number])) return u;
  if (u === "SMALL") return "S";
  if (u === "MEDIUM") return "M";
  if (u === "LARGE") return "L";
  return "M";
}

function heightBand(heightCm: number): number {
  if (heightCm < 155) return -1;
  if (heightCm < 162) return 0;
  if (heightCm < 170) return 1;
  if (heightCm < 178) return 2;
  return 3;
}

function fitDelta(fit: FitPreference): number {
  if (fit === "fitted") return -1;
  if (fit === "relaxed") return 1;
  return 0;
}

/** Rule-based stylist recommendation (replace with model/API later). */
export function recommendSize(inputs: SizeInputs): string {
  const base = ORDER.indexOf(normalizeSize(inputs.usualSize) as (typeof ORDER)[number]);
  const idx = Math.min(
    ORDER.length - 1,
    Math.max(0, (base === -1 ? 3 : base) + heightBand(inputs.heightCm) + fitDelta(inputs.fit)),
  );
  return ORDER[idx];
}

export function giftBodyTypeRecommendation(body: BodyDescription): string {
  const map: Record<BodyDescription, string> = {
    Petite: "S",
    Slim: "S",
    Curvy: "L",
    Tall: "M",
    "Plus Size": "XL",
    "Not Sure": "M",
  };
  return map[body];
}
