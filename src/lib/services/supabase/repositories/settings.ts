import "server-only";
import type { SettingsRepository } from "@/lib/repositories";
import type { SeoMeta, SiteSettings } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export const settingsRepository: SettingsRepository = {
  async get(): Promise<SiteSettings> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Site settings not found");
    const { id: _id, ...settings } = data as SiteSettings & { id: number };
    void _id;
    return settings;
  },

  async getSeoForRoute(routeKey: string): Promise<SeoMeta | null> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("seo_meta")
      .select("*")
      .eq("route_key", routeKey)
      .maybeSingle();
    if (error) throw error;
    return (data as SeoMeta | null) ?? null;
  },

  async update(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("site_settings")
      .update(patch)
      .eq("id", 1)
      .select("*")
      .single();
    if (error) throw error;
    const { id: _id, ...settings } = data as SiteSettings & { id: number };
    void _id;
    return settings;
  },
};
