import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = { email?: string; role?: string };

async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const want = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.trim().toLowerCase() === want);
    if (hit) return hit.id;
    if (data.users.length < perPage) return null;
    page += 1;
    if (page > 100) return null;
  }
}

/**
 * One-time / dev helper: grant hub_staff for an Auth user by email.
 * Requires SUPABASE_SERVICE_ROLE_KEY and HUB_GRANT_SECRET in .env.local.
 *
 * curl -sS -X POST http://localhost:3001/api/hub/grant-access \
 *   -H "Authorization: Bearer YOUR_HUB_GRANT_SECRET" \
 *   -H "Content-Type: application/json" \
 *   -d "{\"email\":\"you@example.com\",\"role\":\"owner\"}"
 */
export async function POST(req: Request) {
  const secret = process.env.HUB_GRANT_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Not configured: set HUB_GRANT_SECRET in yt-admin environment." },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!bearer || bearer !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const role = body.role === "owner" ? "owner" : body.role === "admin" ? "admin" : null;
  if (!email || !role) {
    return NextResponse.json(
      { error: "Body must include email (string) and role (\"admin\" | \"owner\")." },
      { status: 400 },
    );
  }

  try {
    const userId = await findUserIdByEmail(email);
    if (!userId) {
      return NextResponse.json(
        { error: `No auth.users row found for email: ${email}` },
        { status: 404 },
      );
    }

    const admin = createAdminClient();
    const { error } = await admin.from("hub_staff").upsert(
      { user_id: userId, role },
      { onConflict: "user_id" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, user_id: userId, role });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
