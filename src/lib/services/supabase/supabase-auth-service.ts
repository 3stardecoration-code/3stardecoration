import "server-only";
import { redirect } from "next/navigation";
import type { AuthService, SignInResult } from "@/lib/repositories";
import type { AdminSession } from "@/lib/domain";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

async function loadProfile(userId: string, email: string): Promise<AdminSession | null> {
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from("admin_profiles")
    .select("user_id, full_name, avatar_media_asset_id, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    user_id: userId,
    email,
    profile: {
      user_id: data.user_id,
      full_name: data.full_name,
      avatar_media_asset_id: data.avatar_media_asset_id,
      role: data.role,
    },
  };
}

async function getSession(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;
  return loadProfile(user.id, user.email);
}

export const supabaseAuthService: AuthService = {
  getSession,

  async signIn(email: string, password: string): Promise<SignInResult> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.user.email) {
      return { ok: false, error: "Invalid email or password." };
    }
    const session = await loadProfile(data.user.id, data.user.email);
    if (!session) {
      await supabase.auth.signOut();
      return { ok: false, error: "This account is not set up as an admin. Contact the site owner." };
    }
    return { ok: true, session };
  },

  async signOut(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  },

  async requireAdmin(): Promise<AdminSession> {
    const session = await getSession();
    if (!session) redirect("/admin/login");
    return session;
  },
};
