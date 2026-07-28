"use client";

import { useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import { Lightbox } from "./Lightbox";
import type { MediaAsset } from "@/lib/domain";

/** Cinematic gallery: a full-bleed lead image + a two-up grid; any image opens the lightbox. */
export function ProjectGallery({ images }: { images: MediaAsset[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (images.length === 0) return null;

  const [lead, ...rest] = images;

  const zoom =
    "transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]";

  return (
    <>
      <div className="space-y-6">
        <Reveal>
          <button
            type="button"
            onClick={() => setOpen(0)}
            aria-label="Open image 1 in fullscreen"
            className="group relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden bg-line"
          >
            <MediaImage asset={lead} fill sizes="100vw" imgClassName={zoom} />
          </button>
        </Reveal>

        {rest.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((img, i) => (
              <Reveal key={img.id} delay={(i % 2) * 0.06}>
                <button
                  type="button"
                  onClick={() => setOpen(i + 1)}
                  aria-label={`Open image ${i + 2} in fullscreen`}
                  className="group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-line"
                >
                  <MediaImage
                    asset={img}
                    fill
                    sizes="(min-width: 640px) 45vw, 90vw"
                    imgClassName={zoom}
                  />
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {open !== null && (
        <Lightbox
          images={images}
          index={open}
          onClose={() => setOpen(null)}
          onIndexChange={setOpen}
        />
      )}
    </>
  );
}
