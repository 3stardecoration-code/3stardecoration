"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { MediaImage } from "@/components/ui/MediaImage";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { HeroBanner, MediaAsset } from "@/lib/domain";

type Props = { banner: HeroBanner; asset?: MediaAsset };

export function Hero({ banner, asset }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const firstVisit =
      typeof window !== "undefined" && !sessionStorage.getItem("intro-seen");
    const ctx = gsap.context(() => {
      gsap.set(".hero-line > span", { yPercent: 115 });
      gsap.set(".hero-fade", { opacity: 0, y: 18 });
      const tl = gsap.timeline({ delay: firstVisit ? 2.2 : 0.25 });
      tl.to(".hero-line > span", {
        yPercent: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.1,
      }).to(
        ".hero-fade",
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.12 },
        "-=0.6",
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const title = banner.title ?? "Celebrations, beautifully designed";
  const words = title.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines = [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter(Boolean);

  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      {asset && (
        <MediaImage
          asset={asset}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0"
        />
      )}
      {/* Cinematic legibility scrim — light at top to show the photo, dark at the
          bottom where the headline sits. */}
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/25 via-espresso/20 to-espresso/85" />

      <div className="relative z-10 mx-auto flex h-full max-w-[82rem] flex-col justify-end px-6 pb-24 sm:px-8 lg:px-12 lg:pb-28">
        {banner.eyebrow && (
          <p className="hero-fade eyebrow mb-6 text-accent/90">{banner.eyebrow}</p>
        )}
        <h1 className="display max-w-4xl text-ivory text-[13vw] leading-[0.98] sm:text-[8.5vw] lg:text-[6.4rem]">
          {lines.map((line, i) => (
            <span key={i} className="line-mask hero-line">
              <span>{line}</span>
            </span>
          ))}
        </h1>

        {banner.subtitle && (
          <p className="hero-fade mt-7 max-w-md text-base text-ivory/75">{banner.subtitle}</p>
        )}

        <div className="hero-fade mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-ivory transition-colors duration-300 hover:bg-accent-deep"
          >
            View our work <span aria-hidden>→</span>
          </Link>
          <Link
            href="/quote"
            className="inline-flex items-center rounded-full border border-ivory/40 px-7 py-3.5 text-sm font-medium text-ivory transition-colors duration-300 hover:border-ivory hover:bg-ivory/10"
          >
            Get a quote
          </Link>
        </div>
      </div>

      <div className="hero-fade absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.3em] text-ivory/60">
        Scroll
      </div>
    </section>
  );
}
