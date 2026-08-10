import "server-only";
import type { HomepageRepository, HomepageSectionPatch } from "@/lib/repositories";
import type { HomepageSection } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export const homepageRepository: HomepageRepository = {
  async listEnabledSections(): Promise<HomepageSection[]> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as HomepageSection[];
  },

  // --- admin (write) ---
  async listAllSections(): Promise<HomepageSection[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as HomepageSection[];
  },

  async updateSection(id: string, patch: HomepageSectionPatch): Promise<HomepageSection> {
    const supabase = createSupabaseServiceClient();
    const { data: current, error: fetchError } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!current) throw new Error(`Homepage section not found: ${id}`);

    const updatePayload: Record<string, unknown> = {};
    if (patch.is_enabled !== undefined) updatePayload.is_enabled = patch.is_enabled;
    if (patch.config !== undefined) {
      updatePayload.config = { ...(current.config as Record<string, unknown>), ...patch.config };
    }

    const { data, error } = await supabase
      .from("homepage_sections")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as HomepageSection;
  },
};
