import Link from "next/link";
import { getDataService } from "@/lib/services";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getDataService().testimonials.listForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Testimonials</h1>
          <p className="mt-1 text-sm text-gray-500">{testimonials.length} testimonials</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/testimonials/trash" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Trash
          </Link>
          <Link
            href="/admin/testimonials/new"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + New testimonial
          </Link>
        </div>
      </div>

      {testimonials.length === 0 ? (
        <p className="mt-16 text-center text-sm text-gray-500">No testimonials yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Quote</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {testimonials.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.author_name}</td>
                  <td className="max-w-sm truncate px-4 py-3 text-gray-600">{t.quote}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.workflow_status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/testimonials/${t.id}`} className="font-medium text-gray-900 hover:underline">
                      Edit
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
