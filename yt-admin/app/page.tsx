import { redirect } from "next/navigation";
import { getHubContext } from "@/lib/hub-auth";

export default async function Home() {
  const ctx = await getHubContext();
  if (ctx) redirect("/dashboard");
  redirect("/login");
}
