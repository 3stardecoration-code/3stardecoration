"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import type { MediaAsset } from "@/lib/domain";

type Props = { before: MediaAsset; after: MediaAsset };

export function BeforeAfterSlider({ before, after }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const frame = useRef<number | null>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(98, Math.max(2, pct));
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setPosition(clamped));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => updateFromClientX(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, updateFromClientX]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(true);
    setHasInteracted(true);
    updateFromClientX(e.clientX);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      setHasInteracted(true);
      setPosition((p) => Math.max(2, p - 4));
    } else if (e.key === "ArrowRight") {
      setHasInteracted(true);
      setPosition((p) => Math.min(98, p + 4));
    }
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="group relative aspect-[16/10] w-full cursor-ew-resize select-none overflow-hidden bg-charcoal sm:aspect-[16/8]"
    >
      {/* AFTER — full base layer */}
      <MediaImage asset={after} fill sizes="100vw" />

      {/* BEFORE — clipped to the handle position */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <MediaImage asset={before} fill sizes="100vw" />
      </div>

      {/* Labels */}
      <span
        className="pointer-events-none absolute left-6 top-6 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-ivory transition-opacity duration-300 sm:left-10 sm:top-10"
        style={{ opacity: position > 12 ? 1 : 0 }}
      >
        Before
      </span>
      <span
        className="pointer-events-none absolute right-6 top-6 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-ivory transition-opacity duration-300 sm:right-10 sm:top-10"
        style={{ opacity: position < 88 ? 1 : 0 }}
      >
        After
      </span>

      {!hasInteracted && (
        <span className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.25em] text-ivory/70">
          Drag to reveal the transformation
        </span>
      )}

      {/* Divider + handle */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-ivory/80"
        style={{ left: `${position}%` }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Before and after comparison"
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={handleKeyDown}
          className="pointer-events-auto absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-ivory/70 bg-ivory/20 text-ivory backdrop-blur-md transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover:scale-105"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M8 7L3 12L8 17M16 7L21 12L16 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
