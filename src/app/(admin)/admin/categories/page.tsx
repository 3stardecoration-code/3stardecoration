import { getDataService } from "@/lib/services";
import { CategoriesTable } from "@/components/admin/categories/CategoriesTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories | 3 Star CMS",
};

export default async function AdminCategoriesPage() {
  const db = getDataService();
  const [categories, projects, services] = await Promise.all([
    db.categories.list(),
    db.projects.listForAdmin().catch(() => []),
    db.services.listForAdmin().catch(() => []),
  ]);

  const projectCounts: Record<string, number> = {};
  for (const p of projects) {
    if (p.category_id) {
      projectCounts[p.category_id] = (projectCounts[p.category_id] ?? 0) + 1;
    }
  }

  const serviceCounts: Record<string, number> = {};
  for (const s of services) {
    if (s.category_id) {
      serviceCounts[s.category_id] = (serviceCounts[s.category_id] ?? 0) + 1;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            {categories.length} categories used across Portfolio projects and Services
          </p>
        </div>
      </div>

      <div className="mt-6">
        <CategoriesTable
          categories={categories}
          projectCounts={projectCounts}
          serviceCounts={serviceCounts}
        />
      </div>
    </div>
  );
}
