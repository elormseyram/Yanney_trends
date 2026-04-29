import { getHubRole } from "@/lib/hub-auth";
import { fetchOwnerChartSnapshot } from "@/lib/hub/queries";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { OwnerAnalyticsCharts } from "@/components/hub/owner/OwnerAnalyticsCharts";

export default async function OwnerReportsPage() {
  const role = await getHubRole();
  if (!role) return null;

  const snap = await fetchOwnerChartSnapshot();

  return (
    <>
      <HubTopBar title="Reports & margins" role={role} />
      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Charts built from paid orders and the expense log. Owner-only.
        </p>
        {!snap.ok ? (
          <QueryErrorBanner message={snap.message} />
        ) : (
          <OwnerAnalyticsCharts snapshot={snap.data} variant="reports" />
        )}
      </main>
    </>
  );
}
