import "server-only";
import type { CategoryRepository } from "@/lib/repositories";
import type { Category } from "@/lib/domain";
import { createSupabaseAnonClient } from "@/lib/supabase/server";

export const categoryRepository: CategoryRepository = {
  async list(): Promise<Category[]> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as Category | null) ?? null;
  },
};
