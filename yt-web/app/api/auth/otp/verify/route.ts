import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "+233" + cleaned.slice(1);
  if (cleaned.startsWith("233")) return "+" + cleaned;
  return "+" + cleaned;
}

function hmacChallenge(phone: string, expires: number, code: string): string {
  const secret =
    process.env.OTP_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "yanney-otp-fallback";
  return createHmac("sha256", secret)
    .update(`${phone}|${expires}|${code}`)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const { phone, token, email, name } = await req.json();
    if (!phone || !token) {
      return NextResponse.json({ error: "Phone and token are required" }, { status: 400 });
    }

    // Read the signed challenge cookie set by /api/auth/otp/send
    const rawCookie = req.headers.get("cookie") ?? "";
    const match = rawCookie.match(/(?:^|;\s*)_otp_ch=([^;]+)/);
    if (!match) {
      return NextResponse.json(
        { error: "No pending verification found. Please request a new code." },
        { status: 400 },
      );
    }

    const [storedPhone, storedExpires, storedSig] = decodeURIComponent(match[1]).split("|");

    // Expiry check
    if (Date.now() > parseInt(storedExpires, 10)) {
      return NextResponse.json(
        { error: "Code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Phone check
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone !== storedPhone) {
      return NextResponse.json({ error: "Phone number mismatch." }, { status: 400 });
    }

    // HMAC verification — if the user's code matches, the HMACs will be identical
    const expectedSig = hmacChallenge(storedPhone, parseInt(storedExpires, 10), token.trim());
    if (expectedSig !== storedSig) {
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
    }

    // Clear the challenge cookie
    const res = await buildResponse(email, name, normalizedPhone);
    res.cookies.set("_otp_ch", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/api/auth/otp",
      maxAge: 0,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}

async function buildResponse(
  email: string | undefined,
  name: string | undefined,
  normalizedPhone: string,
): Promise<NextResponse> {
  if (!email?.trim()) {
    return NextResponse.json({ success: true });
  }

  const userEmail = email.trim().toLowerCase();
  const admin = createAdminClient();

  // Create user if they don't exist (safe to call — idempotent on duplicate email)
  await admin.auth.admin.createUser({
    email: userEmail,
    email_confirm: true,
    phone: normalizedPhone,
    phone_confirm: true,
    user_metadata: { full_name: name?.trim() || "" },
  });

  // Generate a magic-link token the browser can exchange for a session
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: userEmail,
  });

  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error("[OTP verify] generateLink error:", linkErr?.message);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({
    success: true,
    token_hash: linkData.properties.hashed_token,
    token_type: "magiclink",
  });
}
