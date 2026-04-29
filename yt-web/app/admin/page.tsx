import { headers } from "next/headers";
import { redirect } from "next/navigation";

function normalizeAdminLoginUrl(raw: string): string {
  const u = raw.trim().replace(/\/$/, "");
  if (u.endsWith("/login")) return u;
  return `${u}/login`;
}

/** True when host looks like local dev (phone on Wi‑Fi, laptop, etc.). */
function isLikelyDevHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

export default async function AdminEntryPage() {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  if (envUrl) {
    redirect(normalizeAdminLoginUrl(envUrl));
  }

  const h = await headers();
  const hostHeader = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]?.trim() ?? "";
  const proto = (h.get("x-forwarded-proto") ?? "http").split(",")[0]?.trim() || "http";

  if (hostHeader) {
    const hostname = hostHeader.includes(":") ? hostHeader.slice(0, hostHeader.lastIndexOf(":")) : hostHeader;
    if (isLikelyDevHost(hostname)) {
      redirect(`${proto}://${hostname}:3001/login`);
    }
  }

  redirect("http://localhost:3001/login");
}
