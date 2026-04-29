"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function isTransientFetchError(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  return /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND/i.test(msg);
}

async function signInWithRetry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
  password: string,
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      if (!isTransientFetchError(error) || attempt === 2) throw error;
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithEmailPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextRaw = formData.get("next");
  const next = typeof nextRaw === "string" && nextRaw.startsWith("/") ? nextRaw : "/dashboard";

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const supabase = await createClient();
  let authError: { message: string } | null = null;
  try {
    const result = await signInWithRetry(supabase, email, password);
    authError = result.error;
  } catch {
    authError = {
      message:
        "Network issue while contacting sign-in service. Please check internet and try again.",
    };
  }

  if (authError) {
    const q = new URLSearchParams({ error: "auth", detail: authError.message });
    redirect(`/login?${q.toString()}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=auth");
  }

  const { data: staff } = await supabase
    .from("hub_staff")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!staff?.role) {
    await supabase.auth.signOut();
    redirect("/login?error=forbidden");
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
