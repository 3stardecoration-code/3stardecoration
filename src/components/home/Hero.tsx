"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { MediaImage } from "@/components/ui/MediaImage";
import { Magnetic } from "@/components/ui/Magnetic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { HeroBanner, MediaAsset } from "@/lib/domain";

type Props = { banner: HeroBanner; stack: MediaAsset[] };

export function Hero({ banner, stack }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const firstVisit = typeof window !== "undefined" && !sessionStorage.getItem("intro-seen");
    const ctx = gsap.context(() => {
      gsap.set(".hero-line > span", { yPercent: 115 });
      gsap.set(".hero-fade", { opacity: 0, y: 18 });
      gsap.set(".hero-card", { opacity: 0, scale: 0.92, y: 24 });
      const tl = gsap.timeline({ delay: firstVisit ? 0.5 : 0.15 });
      tl.to(".hero-card", { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.15 }, 0)
        .to(".hero-line > span", { yPercent: 0, duration: 1.2, ease: "power3.out", stagger: 0.1 }, 0.25)
        .to(".hero-fade", { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.1 }, "-=0.7");
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const wrap = root.current;
    const cards = cardsRef.current;
    if (!wrap || !cards) return;

    function handleMove(e: MouseEvent) {
      const rect = wrap!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const items = cards!.querySelectorAll<HTMLElement>(".hero-card");
      items.forEach((card, i) => {
        const depth = (i + 1) * 12;
        gsap.to(card, { x: px * depth, y: py * depth, duration: 0.6, ease: "power2.out", overwrite: "auto" });
      });
    }
    wrap.addEventListener("mousemove", handleMove);
    return () => wrap.removeEventListener("mousemove", handleMove);
  }, [reduced]);

  const title = banner.title ?? "Celebrations, beautifully designed";
  const words = title.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines = [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter(Boolean);

  return (
    <section
      ref={root}
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-ivory py-24 sm:py-28 lg:h-[100svh] lg:min-h-[640px] lg:py-0"
    >
      {stack.length > 0 && (
        <div ref={cardsRef} aria-hidden className="pointer-events-none absolute inset-0">
          {stack[0] && (
            <div className="hero-card absolute left-[1%] top-[6%] hidden w-[16vw] max-w-[230px] min-w-[150px] -rotate-6 border-[6px] border-porcelain shadow-[0_22px_50px_rgba(21,21,21,0.16)] lg:block xl:left-[4%]">
              <div className="relative aspect-[4/5] w-full">
                <MediaImage asset={stack[0]} fill sizes="20vw" />
              </div>
            </div>
          )}
          {stack[1] && (
            <div className="hero-card absolute bottom-[6%] right-[1%] hidden w-[16vw] max-w-[230px] min-w-[150px] rotate-6 border-[6px] border-porcelain shadow-[0_22px_50px_rgba(21,21,21,0.16)] lg:block xl:right-[4%]">
              <div className="relative aspect-[4/5] w-full">
                <MediaImage asset={stack[1]} fill sizes="20vw" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center sm:px-8">
        {stack[0] && (
          <div className="hero-card mb-8 w-[42vw] max-w-[160px] min-w-[120px] -rotate-6 border-[4px] border-porcelain shadow-[0_14px_34px_rgba(21,21,21,0.16)] lg:hidden">
            <div className="relative aspect-[4/5] w-full">
              <MediaImage asset={stack[0]} fill sizes="40vw" />
            </div>
          </div>
        )}

        {banner.eyebrow && <p className="hero-fade eyebrow mb-7 text-accent-deep">{banner.eyebrow}</p>}

        <h1 className="display max-w-xl text-[11vw] leading-[0.98] text-charcoal sm:text-6xl lg:text-7xl">
          {lines.map((line, i) => (
            <span key={i} className="line-mask hero-line">
              <span className={i === lines.length - 1 ? "italic text-accent-deep" : ""}>{line}</span>
            </span>
          ))}
        </h1>

        {banner.subtitle && (
          <p className="hero-fade mt-6 max-w-sm text-[0.95rem] font-light tracking-wide text-stone">
            {banner.subtitle}
          </p>
        )}

        <div className="hero-fade mt-9">
          <Link href="/portfolio" className="group inline-flex items-center gap-4">
            <span className="relative overflow-hidden text-sm font-medium tracking-[0.08em] text-charcoal">
              Explore the Portfolio
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-100 bg-charcoal/30 transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-x-0" />
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-x-100" />
            </span>
            <Magnetic strength={0.4}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/25 text-charcoal transition-all duration-500 ease-[var(--ease-lux)] group-hover:border-accent group-hover:bg-accent group-hover:text-ivory">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-500 ease-[var(--ease-lux)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <path d="M4 12L12 4M12 4H5.5M12 4V10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Magnetic>
          </Link>
        </div>

        {stack[1] && (
          <div className="hero-card mt-10 w-[42vw] max-w-[160px] min-w-[120px] rotate-6 border-[4px] border-porcelain shadow-[0_14px_34px_rgba(21,21,21,0.16)] lg:hidden">
            <div className="relative aspect-[4/5] w-full">
              <MediaImage asset={stack[1]} fill sizes="40vw" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
