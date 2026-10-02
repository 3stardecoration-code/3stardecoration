"use client";

import { useState, useTransition } from "react";
import { reorderCategories, deleteCategory } from "@/app/actions/admin/categories";
import { CategoryModal } from "./CategoryModal";
import type { Category } from "@/lib/domain";

interface CategoriesTableProps {
  categories: Category[];
  projectCounts?: Record<string, number>;
  serviceCounts?: Record<string, number>;
}

export function CategoriesTable({
  categories: initial,
  projectCounts = {},
  serviceCounts = {},
}: CategoriesTableProps) {
  const [categories, setCategories] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setCategories((prev) => {
      const from = prev.findIndex((c) => c.id === dragId);
      const to = prev.findIndex((c) => c.id === targetId);
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
    setError(null);
    startTransition(async () => {
      const res = await reorderCategories(categories.map((c, i) => ({ id: c.id, sort_order: i + 1 })));
      if (res.ok) {
        setDirty(false);
      } else {
        setError(res.error);
      }
    });
  }

  function handleDelete(category: Category) {
    const pCount = projectCounts[category.id] ?? 0;
    const sCount = serviceCounts[category.id] ?? 0;
    if (pCount > 0) {
      alert(`Cannot delete "${category.name}" because ${pCount} portfolio project(s) are currently assigned to it. Please reassign those projects first.`);
      return;
    }
    const message = sCount > 0
      ? `Delete category "${category.name}"? (${sCount} service(s) will be unlinked)`
      : `Delete category "${category.name}"?`;

    if (!window.confirm(message)) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteCategory(category.id);
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
      } else {
        setError(res.error);
      }
    });
  }

  function handleModalSuccess(savedCat: Category) {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === savedCat.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCat.id ? savedCat : c));
      }
      return [...prev, savedCat];
    });
  }

  return (
    <div>
      {/* Top action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <input
            type="search"
            placeholder="Filter categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 pl-9 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-gray-800 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </button>
      </div>

      {dirty && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <span>Sort order changed — save to update live site and navigation.</span>
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

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="w-10 px-3 py-3.5" />
              <th className="px-4 py-3.5">Category Name</th>
              <th className="px-4 py-3.5">Slug</th>
              <th className="px-4 py-3.5 text-center">Projects</th>
              <th className="px-4 py-3.5 text-center">Services</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                  {search ? "No categories match your search." : "No categories yet. Click 'Add Category' to create one."}
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr
                  key={cat.id}
                  draggable={!search}
                  onDragStart={() => setDragId(cat.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(cat.id)}
                  className={`transition-colors hover:bg-gray-50/80 ${
                    dragId === cat.id ? "opacity-30" : ""
                  }`}
                >
                  <td className="cursor-grab px-3 py-3.5 text-gray-300 active:cursor-grabbing text-center">
                    {!search ? "⠿" : ""}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-gray-900">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-500 truncate max-w-xs">{cat.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {cat.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {projectCounts[cat.id] ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {serviceCounts[cat.id] ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsModalOpen(true);
                        }}
                        className="font-medium text-gray-700 hover:text-gray-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        disabled={isPending}
                        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
