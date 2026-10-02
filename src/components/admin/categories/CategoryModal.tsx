"use client";

import { useState, useTransition, useEffect } from "react";
import { createCategory, updateCategory } from "@/app/actions/admin/categories";
import type { Category } from "@/lib/domain";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess: (category: Category) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
      setIsSlugCustom(true);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setIsSlugCustom(false);
    }
    setError(null);
  }, [category, isOpen]);

  function handleNameChange(val: string) {
    setName(val);
    if (!isSlugCustom) {
      setSlug(slugify(val));
    }
  }

  function handleSlugChange(val: string) {
    setIsSlugCustom(true);
    setSlug(slugify(val));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setError(null);
    startTransition(async () => {
      if (category) {
        // Edit existing
        const res = await updateCategory(category.id, {
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          description: description.trim() || null,
        });
        if (res.ok) {
          onSuccess(res.category);
          onClose();
        } else {
          setError(res.error);
        }
      } else {
        // Create new
        const res = await createCategory({
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          description: description.trim() || null,
        });
        if (res.ok) {
          onSuccess(res.category);
          onClose();
        } else {
          setError(res.error);
        }
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {category ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Haldi & Mehendi"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">URL Slug</label>
              {isSlugCustom && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugCustom(false);
                    setSlug(slugify(name));
                  }}
                  className="text-xs text-amber-700 hover:underline"
                >
                  Reset to auto
                </button>
              )}
            </div>
            <div className="mt-1 flex rounded-lg border border-gray-300 shadow-xs focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
              <span className="inline-flex items-center px-3 text-xs text-gray-500 bg-gray-50 rounded-l-lg border-r border-gray-200">
                /portfolio?category=
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="haldi-mehendi"
                className="block w-full rounded-r-lg px-3 py-2 text-sm font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of what this category covers."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {isPending ? "Saving…" : category ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
