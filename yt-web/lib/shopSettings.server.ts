import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SHOP_SETTINGS_PUBLIC,
  parseCutoffTime,
  type ShopSettingsPublic,
} from "@/lib/shopSettingsPublic";

export type { ShopSettingsPublic } from "@/lib/shopSettingsPublic";

export const getShopSettingsPublic = cache(async (): Promise<ShopSettingsPublic> => {
  try {
    const supabase = await createClient();
    const base = await supabase
      .from("shop_settings")
      .select(
        "announcement_text, announcement_active, shop_is_open, delivery_available, pickup_available, delivery_cutoff_time",
      )
      .limit(1)
      .maybeSingle();

    if (base.error || !base.data) return DEFAULT_SHOP_SETTINGS_PUBLIC;

    const marquee = await supabase
      .from("shop_settings")
      .select("marquee_ticker_text, marquee_ticker_active")
      .limit(1)
      .maybeSingle();

    const cutoff = parseCutoffTime(base.data.delivery_cutoff_time);
    const mOk = !marquee.error && marquee.data;

    return {
      announcementText:
        typeof base.data.announcement_text === "string" && base.data.announcement_text.trim()
          ? base.data.announcement_text.trim()
          : null,
      announcementActive: Boolean(base.data.announcement_active),
      marqueeTickerText:
        mOk &&
        typeof marquee.data!.marquee_ticker_text === "string" &&
        marquee.data!.marquee_ticker_text.trim()
          ? marquee.data!.marquee_ticker_text.trim()
          : null,
      marqueeTickerActive: mOk ? Boolean(marquee.data!.marquee_ticker_active) : false,
      shopIsOpen: base.data.shop_is_open !== false,
      deliveryAvailable: base.data.delivery_available !== false,
      pickupAvailable: base.data.pickup_available !== false,
      deliveryCutoffHour: cutoff.hour,
      deliveryCutoffMinute: cutoff.minute,
    };
  } catch {
    return DEFAULT_SHOP_SETTINGS_PUBLIC;
  }
});
