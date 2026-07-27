import "server-only";
import type { DataService, AuthService } from "@/lib/repositories";
import { mockDataService } from "./mock/mock-data-service";
import { mockAuthService } from "./mock/mock-auth-service";

// Single swap point. When the client's Supabase project exists, change these two
// functions to return the Supabase adapters — no UI file changes required.
// TODO(supabase): return supabaseDataService / supabaseAuthService here.
export function getDataService(): DataService {
  return mockDataService;
}

export function getAuthService(): AuthService {
  return mockAuthService;
}
