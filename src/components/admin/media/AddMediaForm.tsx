"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMediaAsset } from "@/app/actions/admin/media";

/**
 * TODO(cloudinary): this URL-based form stands in for a real drag-and-drop
 * upload once Cloudinary is wired (spec §6). It exercises the same
 * MediaRepository.create() write path a real uploader would call.
 */
export function AddMediaForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        {open ? "Cancel" : "+ Add image"}
      </button>

      {open && (
        <form
          ref={formRef}
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const res = await addMediaAsset(formData);
              if (res.ok) {
                formRef.current?.reset();
                setOpen(false);
                router.refresh();
              } else {
                setError(res.error);
              }
            });
          }}
          className="mt-4 max-w-lg space-y-3 rounded-xl border border-gray-200 p-4"
        >
          <p className="text-xs text-gray-400">
            Paste an image URL (e.g. from Unsplash) — this stands in for a real upload until Cloudinary is
            connected.
          </p>
          <input
            name="secure_url"
            required
            placeholder="https://images.unsplash.com/photo-…"
            className="input"
          />
          <input name="alt_text" required placeholder="Describe the image…" className="input" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isPending ? "Adding…" : "Add to library"}
          </button>
        </form>
      )}
    </div>
  );
}
