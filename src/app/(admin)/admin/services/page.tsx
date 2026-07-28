import Link from "next/link";
import { getDataService } from "@/lib/services";
import { ServicesTable } from "@/components/admin/services/ServicesTable";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await getDataService().services.listForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">{services.length} services</p>
        </div>
        <Link href="/admin/services/trash" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          Trash
        </Link>
      </div>

      <div className="mt-6">
        {services.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">No services yet.</p>
        ) : (
          <ServicesTable services={services} />
        )}
      </div>
    </div>
  );
}
