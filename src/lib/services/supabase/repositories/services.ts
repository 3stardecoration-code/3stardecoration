import "server-only";
import type { ServiceRepository, ServicePatch, SortOrderEntry } from "@/lib/repositories";
import type { Service } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

function nowIso(): string {
  return new Date().toISOString();
}

export const serviceRepository: ServiceRepository = {
  async listPublished(): Promise<Service[]> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("workflow_status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Service[];
  },

  async getBySlug(slug: string): Promise<Service | null> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("workflow_status", "published")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return (data as Service | null) ?? null;
  },

  // --- admin (write) ---
  async listForAdmin(): Promise<Service[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Service[];
  },

  async listTrash(): Promise<Service[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Service[];
  },

  async getById(id: string): Promise<Service | null> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Service | null) ?? null;
  },

  async create(input: { title: string }): Promise<Service> {
    const supabase = createSupabaseServiceClient();
    let slug = input.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const { data: existing } = await supabase
      .from("services")
      .select("id")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const { data, error } = await supabase
      .from("services")
      .insert({
        title: input.title,
        slug,
        sort_order: 0,
        workflow_status: "draft",
        robots_index: true,
        robots_follow: true,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as Service;
  },

  async update(id: string, patch: ServicePatch): Promise<Service> {
    const supabase = createSupabaseServiceClient();
    const { data: current, error: fetchError } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!current) throw new Error(`Service not found: ${id}`);

    if (patch.slug) {
      const { data: clash } = await supabase
        .from("services")
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

    const { data, error } = await supabase.from("services").update(updatePayload).eq("id", id).select("*").single();
    if (error) throw error;
    return data as Service;
  },

  async softDelete(id: string): Promise<void> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("services")
      .update({ deleted_at: nowIso() })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Service not found: ${id}`);
  },

  async restore(id: string): Promise<void> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("services")
      .update({ deleted_at: null })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Service not found: ${id}`);
  },

  async emptyTrash(): Promise<number> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("services").delete().not("deleted_at", "is", null).select("id");
    if (error) throw error;
    return (data ?? []).length;
  },

  async reorder(order: SortOrderEntry[]): Promise<void> {
    const supabase = createSupabaseServiceClient();
    for (const { id, sort_order } of order) {
      const { error } = await supabase.from("services").update({ sort_order }).eq("id", id);
      if (error) throw error;
    }
  },
};
