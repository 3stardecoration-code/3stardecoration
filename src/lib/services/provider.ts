import "server-only";
import type { DataService, AuthService } from "@/lib/repositories";
import { mockDataService } from "./mock/mock-data-service";
import { mockAuthService } from "./mock/mock-auth-service";
import { supabaseDataService } from "./supabase/supabase-data-service";
import { supabaseAuthService } from "./supabase/supabase-auth-service";
import { hasSupabaseEnv } from "@/lib/supabase/server";

// Single swap point. Real Supabase credentials in .env.local (or the host's
// env vars) switch every page/action from the in-memory mock to the real
// database automatically — no other file needs to change.
export function getDataService(): DataService {
  return hasSupabaseEnv() ? supabaseDataService : mockDataService;
}

export function getAuthService(): AuthService {
  return hasSupabaseEnv() ? supabaseAuthService : mockAuthService;
}
