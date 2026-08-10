import "server-only";
import type { MediaRepository, MediaListArgs, NewMediaAsset } from "@/lib/repositories";
import type { MediaAsset } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Mirrors the mock's computeUsageCount: counts every reference to each media
 * id across all tables that can point at media_assets. Batches one query per
 * referencing table/column rather than doing it per-asset (N+1).
 */
async function computeUsageCounts(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  ids: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const id of ids) counts[id] = 0;
  if (ids.length === 0) return counts;

  const bump = (col: string | null | undefined) => {
    if (col && col in counts) counts[col] += 1;
  };

  const [
    projectMedia,
    galleryItems,
    heroBanners,
    projects,
    services,
    testimonials,
    categories,
    siteSettings,
    seoMeta,
  ] = await Promise.all([
    supabase.from("project_media").select("media_asset_id").in("media_asset_id", ids),
    supabase.from("gallery_items").select("media_asset_id").in("media_asset_id", ids),
    supabase.from("hero_banners").select("media_asset_id").in("media_asset_id", ids),
    supabase.from("projects").select("cover_media_asset_id, og_media_asset_id"),
    supabase.from("services").select("media_asset_id, og_media_asset_id"),
    supabase.from("testimonials").select("media_asset_id"),
    supabase.from("categories").select("cover_media_asset_id"),
    supabase.from("site_settings").select("default_og_media_asset_id").eq("id", 1).maybeSingle(),
    supabase.from("seo_meta").select("og_media_asset_id"),
  ]);

  for (const row of projectMedia.data ?? []) bump(row.media_asset_id);
  for (const row of galleryItems.data ?? []) bump(row.media_asset_id);
  for (const row of heroBanners.data ?? []) bump(row.media_asset_id);
  for (const row of projects.data ?? []) {
    bump(row.cover_media_asset_id);
    bump(row.og_media_asset_id);
  }
  for (const row of services.data ?? []) {
    bump(row.media_asset_id);
    bump(row.og_media_asset_id);
  }
  for (const row of testimonials.data ?? []) bump(row.media_asset_id);
  for (const row of categories.data ?? []) bump(row.cover_media_asset_id);
  if (siteSettings.data) bump(siteSettings.data.default_og_media_asset_id);
  for (const row of seoMeta.data ?? []) bump(row.og_media_asset_id);

  return counts;
}

function withUsageCounts(assets: MediaAsset[], counts: Record<string, number>): MediaAsset[] {
  return assets.map((a) => ({ ...a, usage_count: counts[a.id] ?? 0 }));
}

export const mediaRepository: MediaRepository = {
  async getById(id: string): Promise<MediaAsset | null> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const service = createSupabaseServiceClient();
    const counts = await computeUsageCounts(service, [id]);
    return { ...(data as MediaAsset), usage_count: counts[id] ?? 0 };
  },

  async getManyByIds(ids: string[]): Promise<Record<string, MediaAsset>> {
    const supabase = createSupabaseAnonClient();
    const out: Record<string, MediaAsset> = {};
    if (ids.length === 0) return out;
    const { data, error } = await supabase.from("media_assets").select("*").in("id", ids).is("deleted_at", null);
    if (error) throw error;
    const rows = (data ?? []) as MediaAsset[];
    if (rows.length === 0) return out;

    const service = createSupabaseServiceClient();
    const counts = await computeUsageCounts(
      service,
      rows.map((r) => r.id),
    );
    for (const row of rows) out[row.id] = { ...row, usage_count: counts[row.id] ?? 0 };
    return out;
  },

  // --- admin (write) ---
  async listForAdmin(args: MediaListArgs = {}): Promise<MediaAsset[]> {
    const supabase = createSupabaseServiceClient();
    let query = supabase.from("media_assets").select("*").is("deleted_at", null);
    if (args.search) {
      query = query.or(`alt_text.ilike.%${args.search}%,title.ilike.%${args.search}%`);
    }
    if (args.type === "image") query = query.eq("source", "cloudinary_image");
    if (args.type === "video") query = query.neq("source", "cloudinary_image");
    if (args.favoriteOnly) query = query.eq("favorite", true);

    const { data, error } = await query.order("uploaded_at", { ascending: args.sort === "oldest" });
    if (error) throw error;
    const rows = (data ?? []) as MediaAsset[];
    const counts = await computeUsageCounts(
      supabase,
      rows.map((r) => r.id),
    );
    return withUsageCounts(rows, counts);
  },

  async listTrash(): Promise<MediaAsset[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as MediaAsset[];
    const counts = await computeUsageCounts(
      supabase,
      rows.map((r) => r.id),
    );
    return withUsageCounts(rows, counts);
  },

  async create(input: NewMediaAsset): Promise<MediaAsset> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("media_assets")
      .insert({
        source: input.source ?? "cloudinary_image",
        public_id: input.public_id ?? null,
        secure_url: input.secure_url,
        thumbnail_url: input.thumbnail_url ?? input.secure_url,
        width: input.width ?? null,
        height: input.height ?? null,
        format: input.format ?? null,
        file_size: input.file_size ?? null,
        alt_text: input.alt_text,
        title: input.title ?? null,
        tags: [],
        favorite: false,
      })
      .select("*")
      .single();
    if (error) throw error;
    return { ...(data as MediaAsset), usage_count: 0 };
  },

  async updateAltText(id: string, alt_text: string): Promise<MediaAsset> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("media_assets")
      .update({ alt_text })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Media asset not found: ${id}`);
    const counts = await computeUsageCounts(supabase, [id]);
    return { ...(data as MediaAsset), usage_count: counts[id] ?? 0 };
  },

  async toggleFavorite(id: string): Promise<MediaAsset> {
    const supabase = createSupabaseServiceClient();
    const { data: current, error: fetchError } = await supabase
      .from("media_assets")
      .select("favorite")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!current) throw new Error(`Media asset not found: ${id}`);

    const { data, error } = await supabase
      .from("media_assets")
      .update({ favorite: !current.favorite })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    const counts = await computeUsageCounts(supabase, [id]);
    return { ...(data as MediaAsset), usage_count: counts[id] ?? 0 };
  },

  async softDelete(id: string): Promise<void> {
    const supabase = createSupabaseServiceClient();
    const { data: current, error: fetchError } = await supabase
      .from("media_assets")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!current) throw new Error(`Media asset not found: ${id}`);

    const counts = await computeUsageCounts(supabase, [id]);
    const usage = counts[id] ?? 0;
    if (usage > 0) {
      throw new Error(
        `Cannot trash this asset — it is used in ${usage} place${usage === 1 ? "" : "s"}. Remove those references first.`,
      );
    }

    const { error } = await supabase.from("media_assets").update({ deleted_at: nowIso() }).eq("id", id);
    if (error) throw error;
  },

  async restore(id: string): Promise<void> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("media_assets")
      .update({ deleted_at: null })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Media asset not found: ${id}`);
  },
};
