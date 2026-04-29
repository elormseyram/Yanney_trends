"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SHOP_SETTINGS_PUBLIC, type ShopSettingsPublic } from "@/lib/shopSettingsPublic";

const defaultValue: ShopSettingsPublic = DEFAULT_SHOP_SETTINGS_PUBLIC;

const ShopSettingsContext = createContext<ShopSettingsPublic>(defaultValue);

export function ShopSettingsProvider({
  value,
  children,
}: {
  value: ShopSettingsPublic;
  children: ReactNode;
}) {
  return <ShopSettingsContext.Provider value={value}>{children}</ShopSettingsContext.Provider>;
}

export function useShopSettings(): ShopSettingsPublic {
  return useContext(ShopSettingsContext);
}
