import Link from "next/link";
import { getDataService } from "@/lib/services";
import { TrashRow } from "@/components/admin/projects/TrashRow";
import { EmptyTrashButton } from "@/components/admin/EmptyTrashButton";
import { emptyProjectsTrash } from "@/app/actions/admin/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsTrashPage() {
  const trashed = await getDataService().projects.listTrash();

  return (
    <div>
      <Link href="/admin/portfolio" className="text-sm text-gray-500 hover:text-gray-900">
        ← All projects
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio Trash</h1>
          <p className="mt-1 text-sm text-gray-500">
            Deleted projects are kept here until restored or permanently removed.
          </p>
        </div>
        <EmptyTrashButton action={emptyProjectsTrash} itemLabel="projects" disabled={trashed.length === 0} />
      </div>

      {trashed.length === 0 ? (
        <p className="mt-16 text-center text-sm text-gray-500">Trash is empty.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Deleted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trashed.map((project) => (
                <TrashRow key={project.id} project={project} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
