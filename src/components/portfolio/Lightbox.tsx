"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { MediaAsset } from "@/lib/domain";

type Props = {
  images: MediaAsset[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};

/** Fullscreen image lightbox with keyboard (←/→/Esc) and touch-swipe support. */
export function Lightbox({ images, index, onClose, onIndexChange }: Props) {
  const touchStartX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback(
    (dir: number) => {
      onIndexChange((index + dir + count) % count);
    },
    [index, count, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  const current = images[index];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${count}`}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-espresso/95 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        if (start === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
        touchStartX.current = null;
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory/10"
      >
        ✕
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous image"
            className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory/10 sm:left-6"
          >
            ←
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next image"
            className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory/10 sm:right-6"
          >
            →
          </button>
        </>
      )}

      <div
        className="relative mx-auto flex h-[82vh] w-[92vw] max-w-6xl items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={current.id}
          src={current.secure_url}
          alt={current.alt_text ?? ""}
          fill
          sizes="92vw"
          className="object-contain"
          priority
        />
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em] text-ivory/60">
        {index + 1} / {count}
      </p>
    </div>
  );
}
