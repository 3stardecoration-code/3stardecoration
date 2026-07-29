"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { MediaImage } from "@/components/ui/MediaImage";
import { Magnetic } from "@/components/ui/Magnetic";
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
      gsap.set(".hero-frame", { scale: 1.12 });
      const tl = gsap.timeline({ delay: firstVisit ? 2.2 : 0.25 });
      tl.to(".hero-frame", { scale: 1, duration: 2.2, ease: "power2.out" }, 0)
        .to(".hero-line > span", { yPercent: 0, duration: 1.2, ease: "power3.out", stagger: 0.1 }, 0.15)
        .to(
          ".hero-fade",
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.12 },
          "-=0.6",
        );
      // Ambient Ken Burns drift continues indefinitely after the entrance.
      gsap.to(".hero-frame", {
        scale: 1.07,
        duration: 18,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2.2,
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const title = banner.title ?? "Celebrations, beautifully designed";
  const words = title.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines = [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter(Boolean);

  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-charcoal">
      {asset && (
        <div className="hero-frame absolute inset-0">
          <MediaImage asset={asset} fill priority sizes="100vw" />
        </div>
      )}
      {/* Cinematic legibility scrim — light at top to show the photo, dark at the
          bottom where the headline sits. */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/15 to-charcoal/90" />

      <div className="relative z-10 mx-auto flex h-full max-w-[82rem] flex-col justify-end px-6 pb-28 sm:px-8 lg:px-12 lg:pb-32">
        {banner.eyebrow && (
          <p className="hero-fade eyebrow mb-7 text-accent">{banner.eyebrow}</p>
        )}
        <h1 className="display max-w-5xl text-ivory text-[13vw] leading-[0.96] sm:text-[8.5vw] lg:text-[6.8rem]">
          {lines.map((line, i) => (
            <span key={i} className="line-mask hero-line">
              <span>{line}</span>
            </span>
          ))}
        </h1>

        {banner.subtitle && (
          <p className="hero-fade mt-8 max-w-sm text-[0.95rem] font-light tracking-wide text-ivory/70">
            {banner.subtitle}
          </p>
        )}

        <div className="hero-fade mt-10">
          <Link href="/portfolio" className="group inline-flex items-center gap-4">
            <span className="relative overflow-hidden text-sm font-medium tracking-[0.08em] text-ivory">
              Explore the Portfolio
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-100 bg-ivory/50 transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-x-0" />
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-x-100" />
            </span>
            <Magnetic strength={0.4}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/35 text-ivory transition-all duration-500 ease-[var(--ease-lux)] group-hover:border-accent group-hover:bg-accent group-hover:text-charcoal">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-500 ease-[var(--ease-lux)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <path d="M4 12L12 4M12 4H5.5M12 4V10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Magnetic>
          </Link>
        </div>
      </div>

      <div className="hero-fade absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-[0.6rem] uppercase tracking-[0.35em] text-ivory/50">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-ivory/20">
          <span className="scroll-tick absolute inset-x-0 top-0 h-full w-full bg-accent" />
        </span>
      </div>

      <style>{`
        @keyframes scroll-tick {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .scroll-tick {
          animation: scroll-tick 2.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-tick { animation: none; }
        }
      `}</style>
    </section>
  );
}
