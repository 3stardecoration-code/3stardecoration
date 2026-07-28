"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateMediaAltText, toggleMediaFavorite, trashMediaAsset } from "@/app/actions/admin/media";
import type { MediaAsset } from "@/lib/domain";

export function MediaCard({ asset }: { asset: MediaAsset }) {
  const [alt, setAlt] = useState(asset.alt_text ?? "");
  const [favorite, setFavorite] = useState(asset.favorite);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image src={asset.secure_url} alt={alt} fill className="object-cover" />
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              setFavorite((v) => !v);
              await toggleMediaFavorite(asset.id);
            })
          }
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-sm shadow-sm transition-colors ${
            favorite ? "bg-amber-400 text-white" : "bg-white/90 text-gray-400 hover:text-amber-500"
          }`}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          ★
        </button>
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
          Used {asset.usage_count}×
        </span>
      </div>
      <div className="p-3">
        <textarea
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => {
            if (alt !== asset.alt_text) {
              startTransition(async () => {
                await updateMediaAltText(asset.id, alt);
              });
            }
          }}
          rows={2}
          placeholder="Alt text…"
          className="w-full resize-none rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!window.confirm("Move this image to Trash?")) return;
            startTransition(async () => {
              const res = await trashMediaAsset(asset.id);
              if (!res.ok) setError(res.error);
            });
          }}
          className="mt-2 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          Trash
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
