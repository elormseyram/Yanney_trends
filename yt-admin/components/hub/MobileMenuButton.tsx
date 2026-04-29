"use client";

import { MenuIcon } from "@/components/hub/HubIcons";
import { useMobileSidebar } from "@/components/hub/MobileSidebarContext";

export function MobileMenuButton() {
  const { open } = useMobileSidebar();
  return (
    <button
      type="button"
      onClick={open}
      className="-ml-1 inline-flex items-center justify-center rounded-lg p-2 text-stone-700 transition hover:bg-stone-100 lg:hidden print:hidden dark:text-stone-200 dark:hover:bg-stone-800"
      aria-label="Open navigation"
    >
      <MenuIcon className="h-5 w-5" />
    </button>
  );
}
