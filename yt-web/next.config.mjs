import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Derive the Supabase hostname from NEXT_PUBLIC_SUPABASE_URL so product
 * images served from Supabase Storage are allowed by next/image without
 * having to hard-code a project ref.
 */
function supabaseRemotePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return { protocol: "https", hostname, pathname: "/**" };
  } catch {
    return null;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  /** LAN dev (phone / hotspot) — avoids Next.js cross-origin warnings for `/_next/*`. */
  allowedDevOrigins: ["192.168.100.19:3001"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.simpleicons.org", pathname: "/**" },
      { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(supabaseRemotePattern() ? [supabaseRemotePattern()] : []),
    ],
  },
};

export default nextConfig;
