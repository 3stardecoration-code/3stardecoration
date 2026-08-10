import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Defense in depth: every admin page already calls requireAdmin() itself, but
// this stops an unauthenticated request from ever reaching a protected route
// (or its data fetches) at the edge, before any page code runs.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  // No real backend configured (local/demo mode) — the mock auth service
  // always has a session, so there is nothing to gate here. Mirrors
  // hasSupabaseEnv() in src/lib/supabase/server.ts — duplicated (not
  // imported) to keep this edge bundle free of unrelated server-only deps.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const PLACEHOLDER = "not-configured";
  if (!supabaseUrl || !anonKey || supabaseUrl.includes(PLACEHOLDER) || anonKey === PLACEHOLDER) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
