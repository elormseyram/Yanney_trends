import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

export async function runHubMiddleware(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  let url: string;
  let key: string;
  try {
    url = getSupabaseUrl();
    key = getSupabaseAnonKey();
  } catch {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions | undefined);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const urlLogin = request.nextUrl.clone();
      urlLogin.pathname = "/login";
      urlLogin.searchParams.set("next", pathname);
      const redir = NextResponse.redirect(urlLogin);
      copyCookies(response, redir);
      return redir;
    }

    const { data: staff } = await supabase
      .from("hub_staff")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!staff?.role) {
      await supabase.auth.signOut();
      const urlForbidden = request.nextUrl.clone();
      urlForbidden.pathname = "/login";
      urlForbidden.searchParams.set("error", "forbidden");
      urlForbidden.searchParams.delete("next");
      const redir = NextResponse.redirect(urlForbidden);
      copyCookies(response, redir);
      return redir;
    }

    if (pathname.startsWith("/dashboard/owner") && staff.role !== "owner") {
      const redir = NextResponse.redirect(new URL("/dashboard", request.url));
      copyCookies(response, redir);
      return redir;
    }
  }

  if (pathname === "/login" && user) {
    const { data: staff } = await supabase
      .from("hub_staff")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (staff?.role) {
      const redir = NextResponse.redirect(new URL("/dashboard", request.url));
      copyCookies(response, redir);
      return redir;
    }
  }

  return response;
}
