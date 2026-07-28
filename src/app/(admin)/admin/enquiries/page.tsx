import Link from "next/link";
import { getDataService } from "@/lib/services";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { EnquiryStatus } from "@/lib/domain";

export const dynamic = "force-dynamic";

const TABS: { label: string; value?: EnquiryStatus }[] = [
  { label: "All" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Closed", value: "closed" },
];

type SearchParams = Promise<{ status?: string }>;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminEnquiriesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const activeStatus = (sp.status as EnquiryStatus | undefined) ?? undefined;

  const db = getDataService();
  const [{ data: all }, { data: filtered }] = await Promise.all([
    db.enquiries.list(),
    db.enquiries.list({ status: activeStatus }),
  ]);

  const counts = {
    new: all.filter((e) => e.status === "new").length,
    contacted: all.filter((e) => e.status === "contacted").length,
    closed: all.filter((e) => e.status === "closed").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Enquiries</h1>
          <p className="mt-1 text-sm text-gray-500">
            {all.length} total enquir{all.length === 1 ? "y" : "ies"} from the quote and contact forms.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => {
          const isActive = tab.value === activeStatus;
          const href = tab.value ? `/admin/enquiries?status=${tab.value}` : "/admin/enquiries";
          const count = tab.value ? counts[tab.value] : all.length;
          return (
            <Link
              key={tab.label}
              href={href}
              className={`relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{count}</span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-gray-900">No enquiries here yet</p>
          <p className="text-sm text-gray-500">New submissions from the quote form will appear in this list.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-900">{e.name}</td>
                  <td className="px-5 py-4 text-gray-600">{e.event_type ?? "—"}</td>
                  <td className="px-5 py-4 text-gray-600">{e.event_city ?? "—"}</td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(e.created_at)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/enquiries/${e.id}`} className="font-medium text-gray-900 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
