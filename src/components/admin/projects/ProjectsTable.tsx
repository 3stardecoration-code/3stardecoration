"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { reorderProjects, trashProject } from "@/app/actions/admin/projects";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Category, MediaAsset, Project } from "@/lib/domain";

type Row = { project: Project; cover?: MediaAsset; category?: Category };

export function ProjectsTable({ rows: initialRows, reorderable }: { rows: Row[]; reorderable: boolean }) {
  const [rows, setRows] = useState(initialRows);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setRows((prev) => {
      const from = prev.findIndex((r) => r.project.id === dragId);
      const to = prev.findIndex((r) => r.project.id === targetId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragId(null);
    setDirty(true);
  }

  function saveOrder() {
    startTransition(async () => {
      await reorderProjects(rows.map((r, i) => ({ id: r.project.id, sort_order: i })));
      setDirty(false);
    });
  }

  function handleTrash(id: string, title: string) {
    if (!window.confirm(`Move "${title}" to Trash?`)) return;
    startTransition(async () => {
      await trashProject(id);
      setRows((prev) => prev.filter((r) => r.project.id !== id));
    });
  }

  return (
    <div>
      {reorderable && dirty && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <span>Order changed — save to apply it to the live portfolio.</span>
          <button
            type="button"
            onClick={saveOrder}
            disabled={isPending}
            className="rounded-md bg-amber-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-900 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save order"}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {reorderable && <th className="w-8 px-3 py-3" />}
              <th className="px-3 py-3 font-medium">Project</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Featured</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(({ project, cover, category }) => (
              <tr
                key={project.id}
                draggable={reorderable}
                onDragStart={() => setDragId(project.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(project.id)}
                className={`transition-colors hover:bg-gray-50 ${dragId === project.id ? "opacity-40" : ""}`}
              >
                {reorderable && (
                  <td className="cursor-grab px-3 py-3 text-gray-300 active:cursor-grabbing" title="Drag to reorder">
                    ⠿
                  </td>
                )}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {cover && (
                        <Image src={cover.secure_url} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{project.title}</p>
                      <p className="text-xs text-gray-400">/{project.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-gray-600">{category?.name ?? "—"}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={project.workflow_status} />
                </td>
                <td className="px-3 py-3">{project.featured_on_homepage ? "★" : "—"}</td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/portfolio/${project.id}`} className="font-medium text-gray-900 hover:underline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleTrash(project.id, project.title)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Trash
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
