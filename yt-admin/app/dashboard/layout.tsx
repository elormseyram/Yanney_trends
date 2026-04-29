import { redirect } from "next/navigation";
import { getHubContext } from "@/lib/hub-auth";
import { DashboardLayoutClient } from "@/components/hub/DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  const { role } = ctx;

  return <DashboardLayoutClient role={role}>{children}</DashboardLayoutClient>;
}
