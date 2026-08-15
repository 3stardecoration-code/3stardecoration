import "server-only";
import type { TestimonialRepository, TestimonialPatch } from "@/lib/repositories";
import type { Testimonial } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

function nowIso(): string {
  return new Date().toISOString();
}

export const testimonialRepository: TestimonialRepository = {
  async listPublished(): Promise<Testimonial[]> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("workflow_status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Testimonial[];
  },

  // --- admin (write) ---
  async listForAdmin(): Promise<Testimonial[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Testimonial[];
  },

  async listTrash(): Promise<Testimonial[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Testimonial[];
  },

  async getById(id: string): Promise<Testimonial | null> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("testimonials").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Testimonial | null) ?? null;
  },

  async create(input: { author_name: string; quote: string }): Promise<Testimonial> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        author_name: input.author_name,
        quote: input.quote,
        rating: 5,
        sort_order: 0,
        workflow_status: "draft",
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as Testimonial;
  },

  async update(id: string, patch: TestimonialPatch): Promise<Testimonial> {
    const supabase = createSupabaseServiceClient();
    const { data: current, error: fetchError } = await supabase
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!current) throw new Error(`Testimonial not found: ${id}`);

    const wasPublished = current.workflow_status === "published";
    const updatePayload: Record<string, unknown> = { ...patch };
    if (patch.workflow_status === "published" && !wasPublished) {
      updatePayload.published_at = nowIso();
    }

    const { data, error } = await supabase
      .from("testimonials")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Testimonial;
  },

  async softDelete(id: string): Promise<void> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("testimonials")
      .update({ deleted_at: nowIso() })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Testimonial not found: ${id}`);
  },

  async restore(id: string): Promise<void> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("testimonials")
      .update({ deleted_at: null })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Testimonial not found: ${id}`);
  },

  async emptyTrash(): Promise<number> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("testimonials").delete().not("deleted_at", "is", null).select("id");
    if (error) throw error;
    return (data ?? []).length;
  },
};
