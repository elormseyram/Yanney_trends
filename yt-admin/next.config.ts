import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Pin the app root when a parent folder (e.g. user home) has another lockfile — avoids wrong
// workspace inference and webpack runtime errors like __webpack_require__.n is not a function.
const appDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Derive the Supabase hostname from NEXT_PUBLIC_SUPABASE_URL so product
 * images served from Supabase Storage load correctly inside next/image
 * components on the admin side too.
 */
function supabaseRemotePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return { protocol: "https" as const, hostname, pathname: "/**" };
  } catch {
    return null;
  }
}

const supabasePattern = supabaseRemotePattern();

const nextConfig: NextConfig = {
  outputFileTracingRoot: appDir,
  allowedDevOrigins: ["172.20.10.2"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(supabasePattern ? [supabasePattern] : []),
    ],
  },
};

export default nextConfig;
