import type { CSSProperties } from "react";

/** Map common fashion colour labels to CSS hex for swatches (product cards, filters). */

const SWATCH: Record<string, string> = {
  ivory: "#f4f0e6",
  cream: "#f5f0e4",
  "off white": "#faf8f5",
  white: "#ffffff",
  black: "#1a1a1a",
  charcoal: "#36454f",
  navy: "#1e2a4a",
  "midnight": "#191970",
  red: "#c41e3a",
  burgundy: "#722f37",
  wine: "#5c1a2e",
  pink: "#ffb6c1",
  blush: "#f4c2c2",
  rose: "#e8b4b8",
  magenta: "#c71585",
  coral: "#ff7f50",
  orange: "#ea580c",
  mustard: "#d4a017",
  yellow: "#facc15",
  gold: "#d4af37",
  green: "#166534",
  emerald: "#059669",
  olive: "#6b7c3e",
  sage: "#9caf88",
  mint: "#b2e8d6",
  blue: "#2563eb",
  "sky blue": "#7dd3fc",
  denim: "#3b5f8a",
  purple: "#6b21a8",
  lilac: "#c8a2c8",
  lavender: "#e6e6fa",
  brown: "#78350f",
  camel: "#c19a6b",
  tan: "#d2b48c",
  beige: "#d4c4a8",
  grey: "#9ca3af",
  gray: "#9ca3af",
  silver: "#c0c0c0",
  nude: "#e8d5c4",
  chocolate: "#4a2c2a",
  multicolor: "linear-gradient(135deg,#f472b6,#60a5fa,#34d399)",
};

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function colorLabelToHex(label: string): string {
  const n = normalize(label);
  if (SWATCH[n]) return SWATCH[n];
  const first = n.split(/[\s/&,-]+/)[0] ?? n;
  if (SWATCH[first]) return SWATCH[first];
  return "#d6d3d1";
}

export function colorLabelToStyle(label: string): CSSProperties {
  const n = normalize(label);
  if (n.includes("multi") || n.includes("print") || n.includes("pattern")) {
    return {
      background: "linear-gradient(135deg,#fbcfe8,#bfdbfe,#bbf7d0)",
    };
  }
  return { backgroundColor: colorLabelToHex(label) };
}
