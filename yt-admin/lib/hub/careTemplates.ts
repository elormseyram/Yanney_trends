/**
 * Default care-instruction copy per product category. Owners/admins can still
 * write their own; these are pre-filled when the category is chosen and the
 * field is empty (or still matches another template).
 *
 * Keys must match `product_categories.slug` values for built-in categories.
 * Newly-added categories fall back to FALLBACK_CARE_TEMPLATE.
 */
export const CARE_TEMPLATES: Readonly<Record<string, string>> = {
  DRESS: [
    "Dry clean only — keeps the cut and embellishments sharp.",
    "Cool iron from the inside; press, do not glide on prints.",
    "Do not bleach.",
    "Hang to dry away from direct sunlight.",
    "Store on a padded hanger to hold the shape.",
  ].join("\n"),
  TWO_PIECE_SET: [
    "Hand wash separately in cold water.",
    "Lay flat to dry — no tumble drying.",
    "Cool iron from the inside.",
    "Avoid harsh detergents and bleach.",
    "Steam to refresh between wears.",
  ].join("\n"),
  OUTFIT: [
    "Hand wash separately in cold water, or dry clean for delicate fabrics.",
    "Lay flat to dry — no tumble drying.",
    "Cool iron from the inside.",
    "Avoid harsh detergents and bleach.",
  ].join("\n"),
  BAG: [
    "Wipe gently with a soft, dry cloth between uses.",
    "Avoid prolonged exposure to water, oils, and direct sunlight.",
    "Stuff with the included pouch or tissue to retain shape when storing.",
    "Condition leather every few months to prevent cracking.",
  ].join("\n"),
  HEELS: [
    "Wipe down after each wear with a soft cloth.",
    "Avoid wet surfaces — water can stain and weaken adhesives.",
    "Stuff with paper or shoe trees to hold the shape.",
    "Store in a breathable shoe bag, away from heat.",
  ].join("\n"),
  SLIPPERS: [
    "Wipe the inner sole with a damp cloth and air dry.",
    "Avoid soaking; spot-clean leather and suede.",
    "Air out between wears.",
    "Store flat in a cool, dry spot.",
  ].join("\n"),
  ACCESSORY: [
    "Keep away from perfume, lotion, and water — they dull the finish.",
    "Wipe with a soft cloth after wearing to remove oils.",
    "Store in the pouch or box provided to prevent tarnishing or scratching.",
  ].join("\n"),
};

export const FALLBACK_CARE_TEMPLATE = [
  "Wipe gently with a soft, dry cloth.",
  "Avoid water, perfume, and direct sunlight.",
  "Store in the dust bag or pouch provided.",
].join("\n");

export function templateForCategory(slug: string | null | undefined): string {
  if (!slug) return FALLBACK_CARE_TEMPLATE;
  return CARE_TEMPLATES[slug] ?? FALLBACK_CARE_TEMPLATE;
}

const ALL_TEMPLATES: ReadonlySet<string> = new Set([
  ...Object.values(CARE_TEMPLATES),
  FALLBACK_CARE_TEMPLATE,
]);

/** True if the user's current text equals one of our templates verbatim. */
export function isTemplateText(text: string): boolean {
  return ALL_TEMPLATES.has(text.trim());
}
