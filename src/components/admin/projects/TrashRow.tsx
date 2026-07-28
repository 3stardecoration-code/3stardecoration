"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreProject } from "@/app/actions/admin/projects";
import type { Project } from "@/lib/domain";

export function TrashRow({ project }: { project: Project }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">{project.title}</td>
      <td className="px-4 py-3 text-gray-500">
        {project.deleted_at ? new Date(project.deleted_at).toLocaleDateString("en-GB") : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await restoreProject(project.id);
              router.refresh();
            })
          }
          className="font-medium text-emerald-600 hover:underline disabled:opacity-50"
        >
          {isPending ? "Restoring…" : "Restore"}
        </button>
      </td>
    </tr>
  );
}
