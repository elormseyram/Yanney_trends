"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getHubContext } from "@/lib/hub-auth";

const BASE = "/dashboard/owner/access";

function fail(msg: string): never {
  redirect(`${BASE}?err=${encodeURIComponent(msg)}`);
}

export async function inviteHubStaff(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") {
    fail("Only owners can add team members.");
  }

  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleRaw = String(formData.get("role") ?? "admin");
  const role = roleRaw === "owner" ? "owner" : "admin";

  if (!full_name) fail("Full name is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Enter a valid email.");
  if (password.length < 8) fail("Password must be at least 8 characters.");

  const admin = createAdminClient();

  const { data: existingUsers, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) fail(listErr.message);
  const existing = existingUsers?.users.find((u) => (u.email ?? "").toLowerCase() === email);

  let userId: string;
  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (createErr || !created.user) {
      fail(createErr?.message ?? "Could not create the user account.");
    }
    userId = created.user.id;
  }

  const { error: profileErr } = await admin
    .from("profiles")
    .upsert({ id: userId, full_name }, { onConflict: "id" });
  if (profileErr) fail(profileErr.message);

  const { error: staffErr } = await admin
    .from("hub_staff")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" });
  if (staffErr) fail(staffErr.message);

  revalidatePath(BASE);
  redirect(`${BASE}?ok=1`);
}

export async function removeHubStaff(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") fail("Only owners can remove team members.");

  const user_id = String(formData.get("user_id") ?? "");
  if (!user_id) fail("Missing user.");
  if (user_id === ctx.user.id) fail("You cannot remove your own access.");

  const admin = createAdminClient();
  const { error } = await admin.from("hub_staff").delete().eq("user_id", user_id);
  if (error) fail(error.message);

  revalidatePath(BASE);
  redirect(`${BASE}?ok=1`);
}

export async function updateHubStaffRole(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") fail("Only owners can change roles.");

  const user_id = String(formData.get("user_id") ?? "");
  const roleRaw = String(formData.get("role") ?? "admin");
  const role = roleRaw === "owner" ? "owner" : "admin";
  if (!user_id) fail("Missing user.");

  const admin = createAdminClient();
  const { error } = await admin.from("hub_staff").update({ role }).eq("user_id", user_id);
  if (error) fail(error.message);

  revalidatePath(BASE);
  redirect(`${BASE}?ok=1`);
}
