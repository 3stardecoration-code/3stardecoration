import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataService } from "@/lib/services";
import { StatusSelect } from "@/components/admin/enquiries/StatusSelect";
import { NotesForm } from "@/components/admin/enquiries/NotesForm";
import { whatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const FIELD_LABELS: Record<string, string> = {
  event_type: "Event type",
  event_city: "City",
  venue: "Venue",
  guest_count: "Guest count",
  budget_range: "Budget",
  preferred_contact_time: "Preferred contact time",
};

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiry = await getDataService().enquiries.getById(id);
  if (!enquiry) notFound();

  const eventFields: Array<[string, string | number | null]> = [
    ["event_type", enquiry.event_type],
    ["event_city", enquiry.event_city],
    ["venue", enquiry.venue],
    ["guest_count", enquiry.guest_count],
    ["budget_range", enquiry.budget_range],
    ["preferred_contact_time", enquiry.preferred_contact_time],
  ];

  const wa = whatsappUrl(enquiry.phone, `Hi ${enquiry.name}, thanks for your enquiry with 3 Star Decoration!`);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/enquiries" className="text-sm text-gray-500 hover:text-gray-900">
        ← All enquiries
      </Link>

      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{enquiry.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submitted {formatDate(enquiry.created_at)} via{" "}
            {enquiry.source === "quote_form" ? "quote form" : "contact form"}
          </p>
        </div>
        <StatusSelect id={enquiry.id} status={enquiry.status} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Contact</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900">{enquiry.phone}</dd>
            </div>
            {enquiry.email && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">{enquiry.email}</dd>
              </div>
            )}
          </dl>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Message on WhatsApp →
          </a>
        </div>

        <div className="rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Event details</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Date</dt>
              <dd className="font-medium text-gray-900">{formatDate(enquiry.event_date)}</dd>
            </div>
            {eventFields
              .filter(([, v]) => v !== null && v !== "")
              .map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <dt className="text-gray-500">{FIELD_LABELS[key]}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      {enquiry.message && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Message</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{enquiry.message}</p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Internal notes</p>
        <p className="mt-1 text-xs text-gray-400">Only visible inside the admin dashboard.</p>
        <div className="mt-3">
          <NotesForm id={enquiry.id} notes={enquiry.notes} />
        </div>
      </div>
    </div>
  );
}
