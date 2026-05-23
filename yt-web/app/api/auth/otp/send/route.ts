import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "+233" + cleaned.slice(1);
  if (cleaned.startsWith("233")) return "+" + cleaned;
  if (!cleaned.startsWith("+")) return "+" + cleaned;
  return "+" + cleaned;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in DB (admin bypasses RLS)
    const admin = createAdminClient();
    const { error: dbError } = await admin.from("otp_tokens").insert({
      phone: normalizedPhone,
      code,
      expires_at: expiresAt.toISOString(),
    });

    if (dbError) {
      console.error("[OTP send] DB insert failed:", dbError.message);
      return NextResponse.json({ error: "Failed to prepare OTP. Please try again." }, { status: 500 });
    }

    // Send via Arkesel
    const arkeselKey = process.env.ARKESEL_SMS_API_KEY;
    if (!arkeselKey) {
      console.warn("[OTP send] ARKESEL_SMS_API_KEY not configured");
      return NextResponse.json({ error: "SMS service is not configured." }, { status: 500 });
    }

    const to = normalizedPhone.replace("+", ""); // Arkesel wants no leading +
    const message = `Your Yanney Trendss code is ${code}. Valid for 10 minutes. Do not share this code.`;

    const smsRes = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": arkeselKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: process.env.ARKESEL_SENDER_ID || "Yanney",
        message,
        recipients: [to],
      }),
    });

    if (!smsRes.ok) {
      const errText = await smsRes.text();
      console.error("[OTP send] Arkesel error:", smsRes.status, errText);
      return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
