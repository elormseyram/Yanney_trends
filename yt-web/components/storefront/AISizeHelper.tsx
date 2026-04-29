"use client";

import { useState } from "react";
import { SizeGuideModal } from "@/components/storefront/SizeGuideModal";

interface AISizeHelperProps {
  onApplySize?: (size: string) => void;
}

export function AISizeHelper({ onApplySize }: AISizeHelperProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-elevated px-3 py-2 font-jost text-sm text-brand-pink transition hover:border-brand-pink/50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M12 3v18M3 12h18" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        Not sure of your size? Size guide &amp; fit help
      </button>
      <SizeGuideModal open={open} onClose={() => setOpen(false)} onApplySize={onApplySize} />
    </>
  );
}
