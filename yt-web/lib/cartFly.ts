import type { CartFlyPayload } from "@/store/uiStore";

export function cartFlyFromElement(el: HTMLElement | null, imageUrl: string): CartFlyPayload | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    sx: r.left,
    sy: r.top,
    sw: Math.max(r.width, 24),
    sh: Math.max(r.height, 24),
    imageUrl,
  };
}
