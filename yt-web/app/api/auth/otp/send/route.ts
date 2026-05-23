import { createHmac } from "crypto";
import { NextResponse } from "next/server";

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "+233" + cleaned.slice(1);
  if (cleaned.startsWith("233")) return "+" + cleaned;
  return "+" + cleaned;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const arkeselKey = process.env.ARKESEL_SMS_API_KEY;
    if (!arkeselKey) {
      console.warn("[OTP send] ARKESEL_SMS_API_KEY not configured");
      return NextResponse.json({ error: "SMS service is not configured." }, { status: 500 });
    }

    const normalizedPhone = normalizePhone(phone);
    const code = generateOtp();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    const sig = hmacChallenge(normalizedPhone, expires, code);

    // Send via Arkesel
    const to = normalizedPhone.replace("+", ""); // Arkesel expects no leading +
    const message = `Your Yanney Trendss code is ${code}. Valid for 10 minutes. Do not share this.`;

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

    // Store the challenge in a signed HttpOnly cookie — no DB table needed
    const res = NextResponse.json({ success: true });
    res.cookies.set("_otp_ch", `${normalizedPhone}|${expires}|${sig}`, {
      httpOnly: true,
      sameSite: "lax",
      path: "/api/auth/otp",
      maxAge: 10 * 60,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
