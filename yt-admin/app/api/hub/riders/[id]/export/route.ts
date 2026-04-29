import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchRiderOrdersDetailed } from "@/lib/hub/queries";
import { buildRiderOrdersCsv } from "@/lib/hub/riderExport";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: staff } = await supabase
    .from("hub_staff")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!staff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: rider, error: rErr } = await supabase
    .from("delivery_riders")
    .select("display_name")
    .eq("id", id)
    .maybeSingle();
  if (rErr || !rider) {
    return NextResponse.json({ error: "Rider not found" }, { status: 404 });
  }

  const res = await fetchRiderOrdersDetailed(id);
  if (!res.ok) {
    return NextResponse.json({ error: res.message }, { status: 500 });
  }

  const name = String(rider.display_name ?? "Rider");
  const csv = buildRiderOrdersCsv(name, res.data);
  const filename = `yanney-rider-${id.slice(0, 8)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
