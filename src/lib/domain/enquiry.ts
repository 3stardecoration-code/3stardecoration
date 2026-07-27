import type { EnquiryStatus, EnquirySource } from "./enums";

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_type: string | null;
  event_date: string | null;
  event_city: string | null;
  venue: string | null;
  guest_count: number | null;
  budget_range: string | null;
  preferred_contact_time: string | null;
  message: string | null;
  status: EnquiryStatus;
  assigned_to: string | null;
  notes: string | null;
  source: EnquirySource;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

// Write-shape for a public submission: no id/status/timestamps/internal fields.
export interface NewEnquiry {
  name: string;
  phone: string;
  email?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  event_city?: string | null;
  venue?: string | null;
  guest_count?: number | null;
  budget_range?: string | null;
  preferred_contact_time?: string | null;
  message?: string | null;
  source: EnquirySource;
}
