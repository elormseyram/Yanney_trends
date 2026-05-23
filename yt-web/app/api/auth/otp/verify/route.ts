import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, token } = await req.json();
    if (!phone || !token) {
      return NextResponse.json({ error: "Phone number and token are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Phone number verified successfully." });
  } catch {
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
