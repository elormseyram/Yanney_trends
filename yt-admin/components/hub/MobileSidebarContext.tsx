"use client";

import { createContext, useContext } from "react";

export type MobileSidebarValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const MobileSidebarContext = createContext<MobileSidebarValue | null>(null);

export function useMobileSidebar(): MobileSidebarValue {
  const ctx = useContext(MobileSidebarContext);
  if (!ctx) {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}
