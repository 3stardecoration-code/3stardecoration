"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { restoreMediaAsset } from "@/app/actions/admin/media";
import type { MediaAsset } from "@/lib/domain";

export function MediaTrashCard({ asset }: { asset: MediaAsset }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image src={asset.secure_url} alt={asset.alt_text ?? ""} fill className="object-cover opacity-60" />
      </div>
      <div className="p-3">
        <p className="truncate text-xs text-gray-500">{asset.alt_text}</p>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await restoreMediaAsset(asset.id);
              router.refresh();
            })
          }
          className="mt-2 text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50"
        >
          {isPending ? "Restoring…" : "Restore"}
        </button>
      </div>
    </div>
  );
}
