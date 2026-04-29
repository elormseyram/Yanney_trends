import { NextResponse } from "next/server";
import { getHubContext } from "@/lib/hub-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "product-images";
const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

function safeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function inferExt(type: string, fallback: string): string {
  if (type === "image/jpeg" || type === "image/jpg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  if (type === "image/gif") return "gif";
  return fallback;
}

export async function POST(req: Request) {
  const ctx = await getHubContext();
  if (!ctx) {
    return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid upload payload." }, { status: 400 });
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "products").replace(/[^a-zA-Z0-9/_-]/g, "");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "No file received." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ ok: false, message: "File is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, message: "File is too large. Maximum 8MB per image." },
      { status: 413 },
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { ok: false, message: "Use a JPG, PNG, WEBP, AVIF or GIF image." },
      { status: 415 },
    );
  }

  const baseName = safeName(file.name.replace(/\.[^./\\]+$/, "")) || "image";
  const ext = inferExt(file.type, baseName.split(".").pop() ?? "jpg");
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${folder || "products"}/${stamp}-${rand}-${baseName}.${ext}`;

  const admin = createAdminClient();
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await admin.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadErr) {
    return NextResponse.json({ ok: false, message: uploadErr.message }, { status: 500 });
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({
    ok: true,
    url: pub.publicUrl,
    path,
    bucket: BUCKET,
    size: file.size,
    type: file.type,
  });
}
