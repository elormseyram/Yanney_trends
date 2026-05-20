import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, token } = await req.json();

    if (!phone || !token) {
      return NextResponse.json({ error: "Phone and token are required" }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error || !data.session) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    // On success, `data.session` will be non-null and a session cookie is set.
    return NextResponse.json({ success: true, session: data.session });
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}