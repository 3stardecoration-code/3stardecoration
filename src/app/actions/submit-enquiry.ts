"use server";

import { z } from "zod";
import { getDataService } from "@/lib/services";

// ---------------------------------------------------------------------------
// Zod schema — mirrors NewEnquiry but validated at the server boundary.
// Honeypot field (_hp) must be empty; bots that fill it are silently dropped.
// TODO(supabase): add Postgres-backed rate limiting (spec §12) once the
//   `rate_limits` table exists — shared across serverless invocations.
// ---------------------------------------------------------------------------
const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  phone: z
    .string()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters"),
  email: z.string().email("Please enter a valid email").max(254).optional().or(z.literal("")),
  event_type: z.string().max(80).optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")),
  event_city: z.string().max(120).optional().or(z.literal("")),
  venue: z.string().max(200).optional().or(z.literal("")),
  // FormData yields "" (not null) for an untouched input, and z.coerce.number()
  // coerces "" to 0, which then fails .min(1) — preprocess strips empty values
  // to undefined first so the field is genuinely optional.
  guest_count: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().int().min(1).max(100000).optional(),
  ),
  budget_range: z.string().max(40).optional().or(z.literal("")),
  preferred_contact_time: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  source: z.enum(["quote_form", "contact_form"]),
  // Honeypot — must be empty. Real users never see or fill this field.
  _hp: z.string().max(0, "Bot detected").optional(),
});

export type EnquiryFormState =
  | { ok: true; enquiryId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitEnquiry(
  _prev: EnquiryFormState | null,
  formData: FormData,
): Promise<EnquiryFormState> {
  // Parse raw FormData into a plain object
  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    event_type: formData.get("event_type") ?? "",
    event_date: formData.get("event_date") ?? "",
    event_city: formData.get("event_city") ?? "",
    venue: formData.get("venue") ?? "",
    guest_count: formData.get("guest_count") ?? undefined,
    budget_range: formData.get("budget_range") ?? "",
    preferred_contact_time: formData.get("preferred_contact_time") ?? "",
    message: formData.get("message") ?? "",
    source: formData.get("source") ?? "quote_form",
    _hp: formData.get("_hp") ?? "",
  };

  const parsed = enquirySchema.safeParse(raw);

  if (!parsed.success) {
    // Honeypot triggered — return success-looking response to confuse bots
    if (parsed.error.issues.some((i) => i.path[0] === "_hp")) {
      return { ok: true, enquiryId: "honeypot" };
    }
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, error: "Please check the form and try again.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const enquiry = await getDataService().enquiries.create({
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      event_type: data.event_type || null,
      event_date: data.event_date || null,
      event_city: data.event_city || null,
      venue: data.venue || null,
      guest_count: data.guest_count ?? null,
      budget_range: data.budget_range || null,
      preferred_contact_time: data.preferred_contact_time || null,
      message: data.message || null,
      source: data.source,
    });
    return { ok: true, enquiryId: enquiry.id };
  } catch (err) {
    console.error("submitEnquiry failed:", err);
    return { ok: false, error: "Something went wrong. Please try again or contact us directly." };
  }
}
