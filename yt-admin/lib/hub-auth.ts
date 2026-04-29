import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { HubRole } from "@/lib/hub-role";

export type HubContext = { user: User; role: HubRole };

export const getHubContext = cache(async (): Promise<HubContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: staff, error: staffErr } = await supabase
    .from("hub_staff")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (staffErr || !staff?.role) return null;
  const role = staff.role as string;
  if (role !== "admin" && role !== "owner") return null;
  return { user, role: role as HubRole };
});

export async function getHubRole(): Promise<HubRole | null> {
  const ctx = await getHubContext();
  return ctx?.role ?? null;
}
