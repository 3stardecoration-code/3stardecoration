import "server-only";
import type { AboutRepository } from "@/lib/repositories";
import type { AboutPageContent } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export const aboutRepository: AboutRepository = {
  async get(): Promise<AboutPageContent> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.from("about_page_content").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("About page content not found");
    const { id: _id, updated_at: _updatedAt, ...content } = data as AboutPageContent & {
      id: number;
      updated_at: string;
    };
    void _id;
    void _updatedAt;
    return content;
  },

  async update(patch: Partial<AboutPageContent>): Promise<AboutPageContent> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("about_page_content")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select("*")
      .single();
    if (error) throw error;
    const { id: _id, updated_at: _updatedAt, ...content } = data as AboutPageContent & {
      id: number;
      updated_at: string;
    };
    void _id;
    void _updatedAt;
    return content;
  },
};
