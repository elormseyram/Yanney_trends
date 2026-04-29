import { createAdminClient } from "@/lib/supabase/admin";
import type { HubStaffMember } from "@/lib/hub/types";
import type { HubQueryError, HubQueryOk } from "@/lib/hub/queries";

/**
 * Lists hub staff (admins + owner). Reads from public.hub_staff and joins
 * auth.users + public.profiles with the service-role client because RLS on
 * hub_staff only exposes the caller's own row.
 */
export async function fetchHubStaffList(): Promise<HubQueryOk<HubStaffMember[]> | HubQueryError> {
  try {
    const admin = createAdminClient();
    const { data: staff, error } = await admin
      .from("hub_staff")
      .select("user_id, role, created_at")
      .order("created_at", { ascending: true });

    if (error) return { ok: false, message: error.message };

    const ids = (staff ?? []).map((s) => s.user_id as string);
    if (ids.length === 0) return { ok: true, data: [] };

    const profileMap = new Map<string, string | null>();
    {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      for (const p of profiles ?? []) {
        profileMap.set(p.id as string, (p.full_name as string | null) ?? null);
      }
    }

    const emailMap = new Map<string, string | null>();
    {
      const { data: usersList, error: usersErr } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (usersErr) return { ok: false, message: usersErr.message };
      for (const u of usersList?.users ?? []) {
        if (ids.includes(u.id)) {
          emailMap.set(u.id, u.email ?? null);
        }
      }
    }

    const rows: HubStaffMember[] = (staff ?? []).map((s) => ({
      user_id: s.user_id as string,
      role: s.role as "admin" | "owner",
      created_at: String(s.created_at),
      email: emailMap.get(s.user_id as string) ?? null,
      full_name: profileMap.get(s.user_id as string) ?? null,
    }));

    return { ok: true, data: rows };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, message };
  }
}
