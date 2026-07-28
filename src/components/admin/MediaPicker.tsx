"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { MediaAsset } from "@/lib/domain";

type Props = {
  assets: MediaAsset[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  label?: string;
};

/** Reusable inline media picker (grid + search) used for cover/hero/avatar fields. */
export function MediaPicker({ assets, selectedId, onSelect, label = "Cover image" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = assets.find((a) => a.id === selectedId) ?? null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) => (a.alt_text ?? "").toLowerCase().includes(q) || (a.title ?? "").toLowerCase().includes(q),
    );
  }, [assets, query]);

  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>

      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {selected ? (
            <Image src={selected.secure_url} alt={selected.alt_text ?? ""} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">None</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {open ? "Close" : selected ? "Change image" : "Choose image"}
          </button>
          {selected && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-left text-xs text-gray-400 hover:text-gray-600"
            >
              Remove
            </button>
          )}
        </div>
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
          <div className="mt-3 grid max-h-72 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
            {filtered.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onSelect(asset.id);
                  setOpen(false);
                }}
                className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition-all ${
                  asset.id === selectedId ? "ring-gray-900" : "ring-transparent hover:ring-gray-300"
                }`}
              >
                <Image src={asset.secure_url} alt={asset.alt_text ?? ""} fill className="object-cover" />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-6 text-center text-sm text-gray-400">No media found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
