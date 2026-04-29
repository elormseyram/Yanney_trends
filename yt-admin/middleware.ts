import { NextResponse, type NextRequest } from "next/server";
import { runHubMiddleware } from "@/lib/supabase/hub-middleware";

export async function middleware(req: NextRequest) {
  try {
    return await runHubMiddleware(req);
  } catch {
    return NextResponse.next({ request: req });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
