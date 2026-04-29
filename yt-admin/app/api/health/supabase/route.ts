import { NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET() {
  try {
    const url = getSupabaseUrl();
    const anon = getSupabaseAnonKey();
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anon },
      cache: "no-store",
    });
    const text = await res.text();
    let authHealth: unknown = null;
    try {
      authHealth = text ? JSON.parse(text) : null;
    } catch {
      authHealth = text;
    }
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      authHealth,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 503 },
    );
  }
}
