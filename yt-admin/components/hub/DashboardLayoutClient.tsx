"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { HubRole } from "@/lib/hub-role";
import HubSidebar from "@/components/hub/HubSidebar";
import { MobileSidebarContext, type MobileSidebarValue } from "@/components/hub/MobileSidebarContext";

export function DashboardLayoutClient({
  role,
  children,
}: {
  role: HubRole;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const value = useMemo<MobileSidebarValue>(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <MobileSidebarContext.Provider value={value}>
      <div className="min-h-screen bg-stone-50 print:bg-white dark:bg-stone-900">
        <HubSidebar role={role} />
        <div className="flex min-w-0 flex-1 flex-col lg:pl-56 print:max-w-none">{children}</div>
      </div>
    </MobileSidebarContext.Provider>
  );
}
