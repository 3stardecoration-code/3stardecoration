import "server-only";
import type { HeroRepository } from "@/lib/repositories";
import type { HeroBanner } from "@/lib/domain";
import { createSupabaseAnonClient } from "@/lib/supabase/server";

export const heroRepository: HeroRepository = {
  async listPublished(): Promise<HeroBanner[]> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .eq("workflow_status", "published")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as HeroBanner[];
  },
};
