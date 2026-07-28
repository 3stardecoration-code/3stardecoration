import Link from "next/link";
import { getDataService } from "@/lib/services";
import { ProjectsTable } from "@/components/admin/projects/ProjectsTable";
import type { WorkflowStatus } from "@/lib/domain";

export const dynamic = "force-dynamic";

const TABS: { label: string; value?: WorkflowStatus }[] = [
  { label: "All" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Unpublished", value: "unpublished" },
];

type SearchParams = Promise<{ status?: string; search?: string }>;

export default async function AdminPortfolioPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status = sp.status as WorkflowStatus | undefined;
  const search = sp.search;

  const db = getDataService();
  const [projects, categories] = await Promise.all([
    db.projects.listForAdmin({ status, search }),
    db.categories.list(),
  ]);
  const catById = new Map(categories.map((c) => [c.id, c]));

  const coverIds = projects.map((p) => p.cover_media_asset_id).filter((x): x is string => Boolean(x));
  const media = await db.media.getManyByIds(coverIds);

  const rows = projects.map((project) => ({
    project,
    cover: project.cover_media_asset_id ? media[project.cover_media_asset_id] : undefined,
    category: catById.get(project.category_id),
  }));

  const reorderable = !status && !search;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio</h1>
          <p className="mt-1 text-sm text-gray-500">{projects.length} projects</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/portfolio/trash" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Trash
          </Link>
          <Link
            href="/admin/portfolio/new"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + New project
          </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex gap-2 border-b border-gray-200">
          {TABS.map((tab) => {
            const isActive = tab.value === status;
            const href = tab.value ? `/admin/portfolio?status=${tab.value}` : "/admin/portfolio";
            return (
              <Link
                key={tab.label}
                href={href}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <form action="/admin/portfolio" className="pb-2">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search projects…"
            className="input w-56"
          />
        </form>
      </div>

      {!reorderable && (
        <p className="mt-3 text-xs text-gray-400">Clear filters and search to drag-and-drop reorder.</p>
      )}

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-gray-900">No projects found</p>
            <p className="text-sm text-gray-500">Try a different filter, or create a new project.</p>
          </div>
        ) : (
          <ProjectsTable rows={rows} reorderable={reorderable} />
        )}
      </div>
    </div>
  );
}
