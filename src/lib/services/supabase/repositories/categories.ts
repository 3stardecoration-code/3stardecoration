import "server-only";
import { cache } from "react";
import type { CategoryRepository, CategoryPatch, SortOrderEntry } from "@/lib/repositories";
import type { Category } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const listCached = cache(async (): Promise<Category[]> => {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
});

export const categoryRepository: CategoryRepository = {
  async list(): Promise<Category[]> {
    return listCached();
  },

  async getById(id: string): Promise<Category | null> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Category | null) ?? null;
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as Category | null) ?? null;
  },

  async create(input: {
    name: string;
    slug?: string;
    description?: string | null;
    cover_media_asset_id?: string | null;
  }): Promise<Category> {
    const supabase = createSupabaseServiceClient();
    const name = input.name.trim();
    if (!name) throw new Error("Category name is required.");

    let slug = input.slug ? slugify(input.slug) : slugify(name);
    if (!slug) slug = `cat-${Date.now().toString().slice(-6)}`;

    // Check slug clash
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Determine next sort order
    const { data: lastItem } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = (lastItem?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        description: input.description?.trim() || null,
        sort_order: sortOrder,
        cover_media_asset_id: input.cover_media_asset_id || null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as Category;
  },

  async update(id: string, patch: CategoryPatch): Promise<Category> {
    const supabase = createSupabaseServiceClient();

    if (patch.slug) {
      const slug = slugify(patch.slug);
      const { data: clash } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();
      if (clash) throw new Error(`Category slug already in use: ${slug}`);
      patch.slug = slug;
    }

    if (patch.name) {
      patch.name = patch.name.trim();
    }

    const { data, error } = await supabase
      .from("categories")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data as Category;
  },

  async delete(id: string): Promise<void> {
    const supabase = createSupabaseServiceClient();

    // Check if any projects are assigned to this category
    const { count: projectCount, error: countErr } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (countErr) throw countErr;
    if (projectCount && projectCount > 0) {
      throw new Error(`Cannot delete this category: ${projectCount} project(s) are currently assigned to it.`);
    }

    // Check if any services are assigned to this category and nullify them
    try {
      await supabase.from("services").update({ category_id: null }).eq("category_id", id);
    } catch {
      // column may not exist yet, ignore
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },

  async reorder(order: SortOrderEntry[]): Promise<void> {
    const supabase = createSupabaseServiceClient();
    await Promise.all(
      order.map(({ id, sort_order }) =>
        supabase.from("categories").update({ sort_order }).eq("id", id)
      )
    );
  },
};
