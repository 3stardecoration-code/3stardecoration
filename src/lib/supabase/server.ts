import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const PLACEHOLDER = "not-configured";

/** True once the client has real Supabase credentials — the switch used everywhere to pick mock vs. real. */
export function hasSupabaseEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url && anonKey && serviceKey && url !== PLACEHOLDER && anonKey !== PLACEHOLDER && serviceKey !== PLACEHOLDER && !url.includes(PLACEHOLDER),
  );
}

/**
 * Plain anon-key client, NOT bound to request cookies — safe to call from
 * anywhere, including build-time contexts like generateStaticParams() where
 * next/headers' cookies() is unavailable. Subject to RLS. This is what every
 * PUBLIC read (published projects, services, etc.) uses; none of the public
 * read policies depend on the caller's session, so no cookie binding is needed.
 */
export function createSupabaseAnonClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

/**
 * Cookie-bound anon-key client — ONLY for auth flows (signIn/signOut/getUser)
 * and middleware, where reading/writing the session cookie is the point.
 * Never use this for ordinary data reads; it requires a request context.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render — middleware refreshes the
          // session cookie on the next request instead. Safe to ignore.
        }
      },
    },
  });
}

/**
 * Service-role client — bypasses Row Level Security entirely. Only ever used
 * from admin server actions/pages AFTER requireAdmin() has verified a real
 * authenticated session; that check is the actual gate, not RLS, for writes.
 * Never import this into any code path a public visitor's request can reach
 * without an admin session check first.
 */
export function createSupabaseServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
