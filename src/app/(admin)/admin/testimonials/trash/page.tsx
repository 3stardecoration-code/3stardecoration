import Link from "next/link";
import { getDataService } from "@/lib/services";
import { TestimonialTrashRow } from "@/components/admin/testimonials/TestimonialTrashRow";

export const dynamic = "force-dynamic";

export default async function TestimonialsTrashPage() {
  const trashed = await getDataService().testimonials.listTrash();

  return (
    <div>
      <Link href="/admin/testimonials" className="text-sm text-gray-500 hover:text-gray-900">
        ← All testimonials
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Testimonials Trash</h1>

      {trashed.length === 0 ? (
        <p className="mt-16 text-center text-sm text-gray-500">Trash is empty.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Quote</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trashed.map((t) => (
                <TestimonialTrashRow key={t.id} testimonial={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
