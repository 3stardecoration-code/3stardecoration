import { notFound } from "next/navigation";
import { getDataService } from "@/lib/services";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDataService();
  const [res, categories, mediaAssets] = await Promise.all([
    db.projects.getById(id),
    db.categories.list(),
    db.media.listForAdmin(),
  ]);
  if (!res) notFound();

  return <ProjectForm project={res.project} categories={categories} mediaAssets={mediaAssets} />;
}
