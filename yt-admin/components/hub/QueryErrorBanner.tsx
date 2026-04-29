/**
 * Friendly, single-line banner shown when a query fails.
 *
 * The raw `message` is intentionally not rendered — it is kept on the
 * component signature so existing call-sites compile, and is logged to the
 * server console for the team to read in the platform logs. Owners and
 * admins should never see column names or stack traces in the UI.
 */
export function QueryErrorBanner({ message }: { message: string }) {
  if (typeof process !== "undefined" && message) {
    console.error("[hub] query failed:", message);
  }

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
    >
      Couldn&apos;t load this just now — give it a moment and refresh.
    </div>
  );
}
