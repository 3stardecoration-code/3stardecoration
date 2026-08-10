import "server-only";
import type { GalleryRepository, GalleryWithItems } from "@/lib/repositories";
import type { Gallery } from "@/lib/domain";
import { createSupabaseAnonClient } from "@/lib/supabase/server";

export const galleryRepository: GalleryRepository = {
  async listActive(): Promise<Gallery[]> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("galleries")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Gallery[];
  },

  async getBySlug(slug: string): Promise<GalleryWithItems | null> {
    const supabase = createSupabaseAnonClient();
    const { data: gallery, error } = await supabase
      .from("galleries")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!gallery) return null;

    const { data: items, error: itemsError } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("gallery_id", gallery.id)
      .order("sort_order", { ascending: true });
    if (itemsError) throw itemsError;

    return { gallery: gallery as Gallery, items: items ?? [] };
  },
};
