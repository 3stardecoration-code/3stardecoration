import "server-only";
import type {
  ProjectRepository,
  ListProjectsArgs,
  ProjectWithMedia,
  AdminListProjectsArgs,
  ProjectPatch,
  SortOrderEntry,
  Paginated,
} from "@/lib/repositories";
import type { Project, ProjectMedia } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const DEFAULT_PAGE_SIZE = 9;

function nowIso(): string {
  return new Date().toISOString();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchMediaFor(projectId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function fetchMediaForPublic(projectId: string) {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export const projectRepository: ProjectRepository = {
  async listPublished(args: ListProjectsArgs = {}): Promise<Paginated<Project>> {
    const supabase = createSupabaseAnonClient();
    const page = args.page ?? 1;
    const pageSize = args.page_size ?? DEFAULT_PAGE_SIZE;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
      .from("projects")
      .select("*", { count: "exact" })
      .eq("workflow_status", "published")
      .is("deleted_at", null);

    if (args.category_slug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", args.category_slug)
        .maybeSingle();
      query = query.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
    }

    const { data, error, count } = await query.order("sort_order", { ascending: true }).range(start, end);
    if (error) throw error;

    const total = count ?? 0;
    return {
      items: (data ?? []) as Project[],
      page,
      page_size: pageSize,
      total,
      has_more: page * pageSize < total,
    };
  },

  async listFeatured(): Promise<Project[]> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("featured_on_homepage", true)
      .eq("workflow_status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Project[];
  },

  async getBySlug(slug: string): Promise<ProjectWithMedia | null> {
    const supabase = createSupabaseAnonClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("workflow_status", "published")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!project) return null;
    const media = await fetchMediaForPublic(project.id);
    return { project: project as Project, media };
  },

  async listPublishedSlugs(): Promise<string[]> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("projects")
      .select("slug")
      .eq("workflow_status", "published")
      .is("deleted_at", null);
    if (error) throw error;
    return (data ?? []).map((p) => p.slug as string);
  },

  // --- admin (write) ---
  async listForAdmin(args: AdminListProjectsArgs = {}): Promise<Project[]> {
    const supabase = createSupabaseServiceClient();
    let query = supabase.from("projects").select("*").is("deleted_at", null);
    if (args.status) query = query.eq("workflow_status", args.status);
    if (args.category_slug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", args.category_slug)
        .maybeSingle();
      query = query.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
    }
    if (args.search) {
      query = query.ilike("title", `%${args.search}%`);
    }
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Project[];
  },

  async listTrash(): Promise<Project[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Project[];
  },

  async getById(id: string): Promise<ProjectWithMedia | null> {
    const supabase = createSupabaseServiceClient();
    const { data: project, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!project) return null;
    const media = await fetchMediaFor(project.id);
    return { project: project as Project, media };
  },

  async create(input: { title: string; category_id: string }): Promise<Project> {
    const supabase = createSupabaseServiceClient();
    let slug = slugify(input.title);
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: input.title,
        slug,
        category_id: input.category_id,
        project_status: "upcoming",
        featured_on_homepage: false,
        sort_order: 0,
        workflow_status: "draft",
        auto_seo_generated: false,
        robots_index: true,
        robots_follow: true,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as Project;
  },

  async update(id: string, patch: ProjectPatch): Promise<Project> {
    const supabase = createSupabaseServiceClient();
    const { data: current, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!current) throw new Error(`Project not found: ${id}`);

    if (patch.slug) {
      const { data: clash } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", patch.slug)
        .neq("id", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (clash) throw new Error(`Slug already in use: ${patch.slug}`);
    }

    const wasPublished = current.workflow_status === "published";
    const updatePayload: Record<string, unknown> = { ...patch };
    if (patch.workflow_status === "published" && !wasPublished) {
      updatePayload.published_at = nowIso();
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Project;
  },

  async softDelete(id: string): Promise<void> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("projects")
      .update({ deleted_at: nowIso() })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Project not found: ${id}`);
  },

  async restore(id: string): Promise<void> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("projects")
      .update({ deleted_at: null })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Project not found: ${id}`);
  },

  async emptyTrash(): Promise<number> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("projects")
      .delete()
      .not("deleted_at", "is", null)
      .select("id");
    if (error) throw error;
    return (data ?? []).length;
  },

  async reorder(order: SortOrderEntry[]): Promise<void> {
    const supabase = createSupabaseServiceClient();
    for (const { id, sort_order } of order) {
      const { error } = await supabase.from("projects").update({ sort_order }).eq("id", id);
      if (error) throw error;
    }
  },

  async setGallery(projectId, mediaAssetIds) {
    const supabase = createSupabaseServiceClient();
    const { error: deleteError } = await supabase.from("project_media").delete().eq("project_id", projectId);
    if (deleteError) throw deleteError;
    if (mediaAssetIds.length === 0) return [];

    const { data, error } = await supabase
      .from("project_media")
      .insert(mediaAssetIds.map((media_asset_id, i) => ({ project_id: projectId, media_asset_id, sort_order: i })))
      .select("*");
    if (error) throw error;
    return (data ?? []) as ProjectMedia[];
  },
};
