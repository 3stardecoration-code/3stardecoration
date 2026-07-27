import "server-only";
import type { AuthService, SignInResult } from "@/lib/repositories";
import type { AdminSession } from "@/lib/domain";

// TODO(supabase): replace the entire stub with Supabase Auth (@supabase/ssr cookie session)
// + admin_profiles lookup + real requireAdmin() that redirects unauthenticated users.
const STUB_SESSION: AdminSession = {
  user_id: "stub-owner",
  email: "owner@3stardecoration.local",
  profile: { user_id: "stub-owner", full_name: "Owner", avatar_media_asset_id: null, role: "owner" },
};

export const mockAuthService: AuthService = {
  async getSession(): Promise<AdminSession | null> {
    // TODO(supabase): read the real cookie session. Mock: always "signed in" for UI dev.
    return STUB_SESSION;
  },
  async signIn(): Promise<SignInResult> {
    // TODO(supabase): verify credentials via Supabase Auth. Mock: always succeeds.
    return { ok: true, session: STUB_SESSION };
  },
  async signOut(): Promise<void> {
    // TODO(supabase): clear the Supabase session cookie. Mock: no-op.
  },
  async requireAdmin(): Promise<AdminSession> {
    // TODO(supabase): redirect('/admin/login') when no admin session. Mock: always returns the stub.
    return STUB_SESSION;
  },
};
