export function FormFlash({
  err,
  ok,
}: {
  err?: string | string[];
  ok?: string | string[];
}) {
  const errMsg = Array.isArray(err) ? err[0] : err;
  const okMsg = Array.isArray(ok) ? ok[0] : ok;
  if (errMsg) {
    return (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {errMsg}
      </div>
    );
  }
  if (okMsg) {
    const label =
      okMsg === "status"
        ? "Order status updated."
        : okMsg === "payment"
          ? "Payment status updated."
          : okMsg === "rider"
            ? "Delivery rider updated."
            : okMsg === "schedule"
              ? "Pickup schedule updated."
              : okMsg === "created"
                ? "Product created — keep editing to add photos and stock."
                : okMsg === "1"
                  ? "Saved."
                  : "Updated.";
    return (
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
        {label}
      </div>
    );
  }
  return null;
}
