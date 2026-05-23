import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "+233" + cleaned.slice(1);
  if (cleaned.startsWith("233")) return "+" + cleaned;
  if (!cleaned.startsWith("+")) return "+" + cleaned;
  return "+" + cleaned;
}

export async function POST(req: Request) {
  try {
    const { phone, token, email, name } = await req.json();
    if (!phone || !token) {
      return NextResponse.json({ error: "Phone and token are required" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const admin = createAdminClient();

    // Find the most recent unused, unexpired OTP for this phone
    const { data: record, error: findErr } = await admin
      .from("otp_tokens")
      .select("id, code, expires_at")
      .eq("phone", normalizedPhone)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findErr || !record) {
      return NextResponse.json(
        { error: "Code expired or not found. Please request a new one." },
        { status: 400 },
      );
    }

    if (record.code !== token.trim()) {
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
    }

    // Mark as used
    await admin.from("otp_tokens").update({ used: true }).eq("id", record.id);

    // Create or retrieve Supabase auth user so they can view order history
    if (email?.trim()) {
      const userEmail = email.trim().toLowerCase();

      // createUser with email_confirm: true — safe to call even if user exists
      // (if it fails with "already registered" we still proceed to generateLink)
      await admin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        phone: normalizedPhone,
        phone_confirm: true,
        user_metadata: { full_name: name?.trim() || "" },
      });

      // Generate a magic-link token the browser client can exchange for a session
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email: userEmail,
      });

      if (!linkErr && linkData?.properties?.hashed_token) {
        return NextResponse.json({
          success: true,
          token_hash: linkData.properties.hashed_token,
          token_type: "magiclink",
        });
      }

      console.error("[OTP verify] generateLink error:", linkErr?.message);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
