"use client";

import { useRef } from "react";
import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { Project, MediaAsset, Category } from "@/lib/domain";

type Props = {
  project: Project;
  cover?: MediaAsset;
  category?: Category;
  sizes: string;
  priority?: boolean;
  aspect?: string;
};

const MAX_TILT = 6;

/** Featured-work card with a mouse-tracked 3D tilt and a "View Project" reveal. */
export function TiltProjectCard({ project, cover, category, sizes, priority, aspect = "aspect-[4/5]" }: Props) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const reduced = usePrefersReducedMotion();
  const label = category?.name ?? project.event_type ?? "Event";

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (reduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) scale3d(1.015,1.015,1.015)`;
  }

  function handleMouseLeave() {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  }

  return (
    <Link
      ref={cardRef}
      href={`/portfolio/${project.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group block [transition:transform_0.4s_var(--ease-lux)] [transform-style:preserve-3d] will-change-transform"
    >
      <div className={`relative ${aspect} overflow-hidden bg-line`}>
        {cover && (
          <MediaImage
            asset={cover}
            fill
            sizes={sizes}
            priority={priority}
            imgClassName="transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.08]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Minimal caption: title always visible; category + "View Project" reveal on hover */}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="max-h-0 overflow-hidden text-[0.62rem] font-medium uppercase tracking-[0.28em] text-accent opacity-0 transition-all duration-400 ease-[var(--ease-lux)] group-hover:max-h-6 group-hover:opacity-100">
            {label}
          </p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <h3 className="font-[family-name:var(--font-display)] text-xl text-ivory sm:text-2xl">
              {project.title}
            </h3>
            <span className="mb-0.5 flex shrink-0 translate-y-2 items-center gap-1.5 text-xs font-medium tracking-wide text-ivory opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:translate-y-0 group-hover:opacity-100">
              View Project <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
