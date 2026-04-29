/** Client-safe shop flags for storefront (no server imports). */

export type ShopSettingsPublic = {
  announcementText: string | null;
  announcementActive: boolean;
  marqueeTickerText: string | null;
  marqueeTickerActive: boolean;
  shopIsOpen: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  /** Daily order cutoff (local device time), from hub `delivery_cutoff_time`. */
  deliveryCutoffHour: number;
  deliveryCutoffMinute: number;
};

export const DEFAULT_SHOP_SETTINGS_PUBLIC: ShopSettingsPublic = {
  announcementText: null,
  announcementActive: false,
  marqueeTickerText: null,
  marqueeTickerActive: false,
  shopIsOpen: true,
  deliveryAvailable: true,
  pickupAvailable: true,
  deliveryCutoffHour: 18,
  deliveryCutoffMinute: 0,
};

export function parseCutoffTime(raw: unknown): { hour: number; minute: number } {
  if (raw == null || raw === "") return { hour: 18, minute: 0 };
  const s = String(raw).trim();
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?/.exec(s);
  if (!m) return { hour: 18, minute: 0 };
  const hour = Math.min(23, Math.max(0, Number.parseInt(m[1], 10)));
  const minute = Math.min(59, Math.max(0, Number.parseInt(m[2], 10)));
  return { hour: Number.isFinite(hour) ? hour : 18, minute: Number.isFinite(minute) ? minute : 0 };
}
