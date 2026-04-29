"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHubContext } from "@/lib/hub-auth";

export async function createRider(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") {
    redirect("/dashboard/riders?err=" + encodeURIComponent("Only owners can add riders."));
  }

  const display_name = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const vehicle_note = String(formData.get("vehicle_note") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!display_name) {
    redirect("/dashboard/riders?err=" + encodeURIComponent("Rider name is required."));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("delivery_riders").insert({
    display_name,
    phone,
    vehicle_note,
    notes,
    is_active: true,
  });

  if (error) {
    redirect("/dashboard/riders?err=" + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/riders");
  redirect("/dashboard/riders?ok=1");
}

export async function setRiderActive(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") {
    redirect("/dashboard/riders?err=" + encodeURIComponent("Only owners can change riders."));
  }

  const id = String(formData.get("id") ?? "");
  const is_active = formData.get("is_active") === "true";
  if (!id) redirect("/dashboard/riders?err=" + encodeURIComponent("Missing rider."));

  const supabase = await createClient();
  const { error } = await supabase.from("delivery_riders").update({ is_active }).eq("id", id);

  if (error) {
    redirect("/dashboard/riders?err=" + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/riders");
  redirect("/dashboard/riders?ok=1");
}
