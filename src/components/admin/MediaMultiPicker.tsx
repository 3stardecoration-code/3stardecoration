"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { MediaAsset } from "@/lib/domain";

type Props = {
  assets: MediaAsset[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
};

/**
 * Reusable inline multi-select media picker — used for gallery-style fields
 * (e.g. Instagram wall, project galleries). The "selected" preview grid is
 * drag-and-drop sortable: the order of `selectedIds` is what the public
 * site renders, so dragging a thumbnail to a new spot reorders the array.
 */
export function MediaMultiPicker({ assets, selectedIds, onChange, label = "Photos" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...selectedIds];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  const selected = selectedIds
    .map((id) => assets.find((a) => a.id === id))
    .filter((a): a is MediaAsset => Boolean(a));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) => (a.alt_text ?? "").toLowerCase().includes(q) || (a.title ?? "").toLowerCase().includes(q),
    );
  }, [assets, query]);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
  }

  function remove(id: string) {
    onChange(selectedIds.filter((existing) => existing !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {open ? "Close" : "Manage photos"}
        </button>
      </div>

      {selected.length > 0 && (
        <p className="mt-3 text-xs text-gray-400">Drag to reorder — this is the order shown on the site.</p>
      )}
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {selected.map((asset, index) => (
          <div
            key={asset.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => {
              e.preventDefault();
              if (index !== overIndex) setOverIndex(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) reorder(dragIndex, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg border transition-all active:cursor-grabbing ${
              dragIndex === index
                ? "border-gray-400 opacity-40"
                : overIndex === index && dragIndex !== null
                  ? "border-gray-900"
                  : "border-gray-200"
            }`}
          >
            <Image src={asset.secure_url} alt={asset.alt_text ?? ""} fill className="pointer-events-none object-cover" />
            <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-semibold text-white">
              {index + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(asset.id)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}
        {selected.length === 0 && <p className="col-span-full text-sm text-gray-400">No photos selected.</p>}
      </div>

      {open && (
        <div className="mt-3 rounded-xl border border-gray-200 p-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search media…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <div className="mt-3 max-h-72 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {filtered.map((asset) => {
                const isSelected = selectedIds.includes(asset.id);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggle(asset.id)}
                    className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition-all ${
                      isSelected ? "ring-gray-900" : "ring-transparent hover:ring-gray-300"
                    }`}
                  >
                    <Image src={asset.secure_url} alt={asset.alt_text ?? ""} fill className="object-cover" />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-lg font-semibold text-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="col-span-full py-6 text-center text-sm text-gray-400">No media found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
