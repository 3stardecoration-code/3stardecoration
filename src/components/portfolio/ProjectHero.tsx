"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MediaImage } from "@/components/ui/MediaImage";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { MediaAsset } from "@/lib/domain";

type Props = {
  title: string;
  category: string;
  meta: string[];
  cover?: MediaAsset;
};

export function ProjectHero({ title, category, meta, cover }: Props) {
  const root = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.set(".ph-line > span", { yPercent: 115 });
      gsap.set(".ph-fade", { opacity: 0, y: 16 });
      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(".ph-line > span", { yPercent: 0, duration: 1.1, ease: "power3.out", stagger: 0.1 }).to(
        ".ph-fade",
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.1 },
        "-=0.5",
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} className="relative h-[92svh] min-h-[560px] w-full overflow-hidden">
      {cover && <MediaImage asset={cover} fill priority sizes="100vw" className="absolute inset-0" />}
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/35 via-espresso/15 to-espresso/85" />

      <div className="relative z-10 mx-auto flex h-full max-w-[82rem] flex-col justify-end px-6 pb-20 sm:px-8 lg:px-12 lg:pb-24">
        <p className="ph-fade eyebrow mb-5 text-accent">{category}</p>
        <h1 className="display max-w-4xl text-ivory text-[12vw] leading-[0.98] sm:text-[8vw] lg:text-[5.5rem]">
          <span className="line-mask ph-line">
            <span>{title}</span>
          </span>
        </h1>
        {meta.length > 0 && (
          <div className="ph-fade mt-7 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-ivory/75">
            {meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
