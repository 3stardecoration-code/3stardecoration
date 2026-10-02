import "server-only";
import type { ServiceRepository, ServicePatch, SortOrderEntry } from "@/lib/repositories";
import type { Service } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

function nowIso(): string {
  return new Date().toISOString();
}

function mapService(row: Record<string, unknown> | null): Service | null {
  if (!row) return null;
  const svc = row as unknown as Service;
  return {
    ...svc,
    category_id: (row.category_id as string | null) ?? null,
  };
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
    return (data ?? []).map((r) => mapService(r as Record<string, unknown>)!) as Service[];
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
    return mapService(data as Record<string, unknown> | null);
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
    return (data ?? []).map((r) => mapService(r as Record<string, unknown>)!) as Service[];
  },

  async listTrash(): Promise<Service[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapService(r as Record<string, unknown>)!) as Service[];
  },

  async getById(id: string): Promise<Service | null> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return mapService(data as Record<string, unknown> | null);
  },

  async create(input: { title: string; category_id?: string | null }): Promise<Service> {
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

    const insertPayload: Record<string, unknown> = {
      title: input.title,
      slug,
      sort_order: 0,
      workflow_status: "draft",
      robots_index: true,
      robots_follow: true,
    };
    if (input.category_id) {
      insertPayload.category_id = input.category_id;
    }

    let { data, error } = await supabase
      .from("services")
      .insert(insertPayload)
      .select("*")
      .single();

    // Fallback if category_id column does not exist yet
    if (error && error.code === "42703" && "category_id" in insertPayload) {
      delete insertPayload.category_id;
      const retry = await supabase.from("services").insert(insertPayload).select("*").single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return mapService(data as Record<string, unknown>)!;
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

    let { data, error } = await supabase.from("services").update(updatePayload).eq("id", id).select("*").single();

    // Fallback if category_id column does not exist yet
    if (error && error.code === "42703" && "category_id" in updatePayload) {
      delete updatePayload.category_id;
      const retry = await supabase.from("services").update(updatePayload).eq("id", id).select("*").single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return mapService(data as Record<string, unknown>)!;
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
    const { data, error } = await supabase
      .from("services")
      .delete()
      .not("deleted_at", "is", null)
      .select("id");
    if (error) throw error;
    return data?.length ?? 0;
  },

  async reorder(order: SortOrderEntry[]): Promise<void> {
    const supabase = createSupabaseServiceClient();
    await Promise.all(
      order.map(({ id, sort_order }) =>
        supabase.from("services").update({ sort_order }).eq("id", id)
      )
    );
  },
};
