import { redirect } from "next/navigation";
import { getHubContext } from "@/lib/hub-auth";

export default async function OwnerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getHubContext();
  if (!ctx || ctx.role !== "owner") {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
