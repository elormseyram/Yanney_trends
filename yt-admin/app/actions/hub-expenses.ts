"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHubContext } from "@/lib/hub-auth";

export async function createExpense(formData: FormData): Promise<void> {
  const ctx = await getHubContext();
  if (!ctx) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "general";
  const amountRaw = String(formData.get("amount") ?? "");
  const currency = String(formData.get("currency") ?? "").trim() || "GHS";
  const incurred_on = String(formData.get("incurred_on") ?? "").trim();
  const vendor = String(formData.get("vendor") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const amount = Number.parseFloat(amountRaw);
  if (!title || Number.isNaN(amount) || amount < 0) {
    redirect("/dashboard/expenses?err=" + encodeURIComponent("Title and a valid amount are required."));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("hub_expenses").insert({
    title,
    category,
    amount,
    currency,
    incurred_on: incurred_on || new Date().toISOString().slice(0, 10),
    vendor,
    notes,
    created_by: user?.id ?? null,
  });

  if (error) {
    redirect("/dashboard/expenses?err=" + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");
  redirect("/dashboard/expenses?ok=1");
}
