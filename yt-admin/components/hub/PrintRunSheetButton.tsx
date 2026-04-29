"use client";

export function PrintRunSheetButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm hover:bg-stone-50 print:hidden dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
    >
      Print / Save as PDF
    </button>
  );
}
