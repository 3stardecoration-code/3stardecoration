import { notFound } from "next/navigation";
import { getDataService } from "@/lib/services";
import { ServiceForm } from "@/components/admin/services/ServiceForm";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDataService();
  const [service, mediaAssets] = await Promise.all([db.services.getById(id), db.media.listForAdmin()]);
  if (!service) notFound();

  return <ServiceForm service={service} mediaAssets={mediaAssets} />;
}
