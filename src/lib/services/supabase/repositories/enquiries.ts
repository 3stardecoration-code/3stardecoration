import "server-only";
import type { EnquiryRepository } from "@/lib/repositories";
import type { Enquiry, EnquiryStatus, NewEnquiry } from "@/lib/domain";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export const enquiryRepository: EnquiryRepository = {
  // Public write (quote/contact form) — RLS allows anon insert for this table only.
  async create(input: NewEnquiry): Promise<Enquiry> {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase
      .from("enquiries")
      .insert({
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        event_type: input.event_type ?? null,
        event_date: input.event_date ?? null,
        event_city: input.event_city ?? null,
        venue: input.venue ?? null,
        guest_count: input.guest_count ?? null,
        budget_range: input.budget_range ?? null,
        preferred_contact_time: input.preferred_contact_time ?? null,
        message: input.message ?? null,
        status: "new",
        source: input.source,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as Enquiry;
  },

  // --- admin (write) ---
  async list(args?: { limit?: number; status?: EnquiryStatus }): Promise<{ data: Enquiry[] }> {
    const supabase = createSupabaseServiceClient();
    let query = supabase.from("enquiries").select("*").order("created_at", { ascending: false });
    if (args?.status) query = query.eq("status", args.status);
    if (args?.limit) query = query.limit(args.limit);
    const { data, error } = await query;
    if (error) throw error;
    return { data: (data ?? []) as Enquiry[] };
  },

  async getById(id: string): Promise<Enquiry | null> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("enquiries").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Enquiry | null) ?? null;
  },

  async update(id: string, patch: { status?: EnquiryStatus; notes?: string | null }): Promise<Enquiry> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("enquiries")
      .update(patch)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Enquiry not found: ${id}`);
    return data as Enquiry;
  },
};
