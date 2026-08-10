import "server-only";
import type { LegalRepository } from "@/lib/repositories";
import type { LegalPage } from "@/lib/domain";
import { createSupabaseAnonClient } from "@/lib/supabase/server";

export const legalRepository: LegalRepository = {
  async getBySlug(slug: string): Promise<LegalPage | null> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.from("legal_pages").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as LegalPage | null) ?? null;
  },
};
