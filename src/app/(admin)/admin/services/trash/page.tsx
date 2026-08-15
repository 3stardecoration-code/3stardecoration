import Link from "next/link";
import { getDataService } from "@/lib/services";
import { ServiceTrashRow } from "@/components/admin/services/ServiceTrashRow";
import { EmptyTrashButton } from "@/components/admin/EmptyTrashButton";
import { emptyServicesTrash } from "@/app/actions/admin/services";

export const dynamic = "force-dynamic";

export default async function ServicesTrashPage() {
  const trashed = await getDataService().services.listTrash();

  return (
    <div>
      <Link href="/admin/services" className="text-sm text-gray-500 hover:text-gray-900">
        ← All services
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Services Trash</h1>
        <EmptyTrashButton action={emptyServicesTrash} itemLabel="services" disabled={trashed.length === 0} />
      </div>

      {trashed.length === 0 ? (
        <p className="mt-16 text-center text-sm text-gray-500">Trash is empty.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Deleted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trashed.map((service) => (
                <ServiceTrashRow key={service.id} service={service} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
