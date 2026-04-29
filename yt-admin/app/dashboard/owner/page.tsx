import { getHubRole } from "@/lib/hub-auth";
import { fetchOwnerChartSnapshot } from "@/lib/hub/queries";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { OwnerAnalyticsCharts } from "@/components/hub/owner/OwnerAnalyticsCharts";

export default async function OwnerOverviewPage() {
  const role = await getHubRole();
  if (!role) return null;

  const snap = await fetchOwnerChartSnapshot();

  return (
    <>
      <HubTopBar title="Owner overview" role={role} />
      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          A simple snapshot of the last thirty days: money in from paid orders, what you logged as spend, and how busy the
          shop has been.
        </p>
        {!snap.ok ? (
          <QueryErrorBanner message={snap.message} />
        ) : (
          <OwnerAnalyticsCharts snapshot={snap.data} variant="overview" />
        )}
      </main>
    </>
  );
}
