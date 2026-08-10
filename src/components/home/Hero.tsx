"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import { BoomerangVideoBg } from "@/components/home/BoomerangVideoBg";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { HeroBanner } from "@/lib/domain";

type Props = { banner: HeroBanner };

const PROCESS = [
  { n: "01", label: "Concept & Design" },
  { n: "02", label: "Styling & Setup" },
  { n: "03", label: "Your Celebration" },
];

export function Hero({ banner }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const firstVisit = typeof window !== "undefined" && !sessionStorage.getItem("intro-seen");
    const ctx = gsap.context(() => {
      gsap.set(".hero-line > span", { yPercent: 115 });
      gsap.set(".hero-fade", { opacity: 0, y: 18 });
      const tl = gsap.timeline({ delay: firstVisit ? 0.6 : 0.2 });
      tl.to(".hero-line > span", { yPercent: 0, duration: 1.2, ease: "power3.out", stagger: 0.1 }, 0)
        .to(".hero-fade", { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.1 }, "-=0.7");
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const title = banner.title ?? "Celebrations, beautifully designed";
  const words = title.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines = [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter(Boolean);

  return (
    <section ref={root} className="relative flex h-[100svh] min-h-[720px] w-full flex-col overflow-hidden bg-charcoal">
      <BoomerangVideoBg src="/demo-assets/video/hero-hall-reveal.mp4" />
      {/* Legibility scrim over the video/canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/20 to-charcoal/70" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 pt-28 text-center sm:px-8 sm:pt-32 md:pt-36">
        {banner.eyebrow && <p className="hero-fade eyebrow mb-7 text-accent">{banner.eyebrow}</p>}

        <h1 className="display max-w-2xl text-[12vw] leading-[0.98] text-ivory sm:text-6xl lg:text-7xl">
          {lines.map((line, i) => (
            <span key={i} className="line-mask hero-line">
              <span className={i === lines.length - 1 ? "italic text-accent" : ""}>{line}</span>
            </span>
          ))}
        </h1>

        {banner.subtitle && (
          <p className="hero-fade mt-6 max-w-sm text-[0.95rem] font-light tracking-wide text-ivory/70">
            {banner.subtitle}
          </p>
        )}

        <div className="hero-fade mt-9">
          <Link href="/portfolio" className="group inline-flex items-center gap-4">
            <span className="relative overflow-hidden text-sm font-medium tracking-[0.08em] text-ivory">
              Explore the Portfolio
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-100 bg-ivory/40 transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-x-0" />
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

      {/* "What we do" info panel, flush to the bottom of the first viewport */}
      <div className="hero-fade relative z-10 mt-auto w-full px-4 sm:px-6">
        <div className="mx-auto max-w-5xl border border-ivory/15 border-b-0 bg-ivory/95 px-5 pt-8 shadow-[0_-24px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:px-8 sm:pt-12 md:px-12 md:pt-14">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 md:gap-16">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-charcoal/50">What We Do</p>
              <h2 className="display mt-3 text-2xl font-normal leading-tight tracking-tight text-charcoal sm:text-3xl md:text-4xl">
                Design that
                <br className="hidden sm:block" /> holds the room
              </h2>
            </div>
            <div className="flex items-end">
              <p className="text-sm leading-relaxed text-stone md:text-[15px]">
                From first sketch to final petal — florals, drapery, lighting, and staging, designed as one
                cohesive scene built around your celebration.
              </p>
            </div>
          </div>

          <div className="mt-6 h-px w-full bg-line sm:mt-8 md:mt-10" />

          <div className="grid gap-2 py-6 sm:grid-cols-3 sm:gap-3 sm:py-8">
            {PROCESS.map((step) => (
              <div
                key={step.n}
                className="group flex cursor-default items-center justify-between bg-[#f4f3f1] px-4 py-3.5 transition-colors duration-200 hover:bg-[#eae7e1] sm:px-6 sm:py-4"
              >
                <span className="text-sm text-charcoal">
                  <span className="text-accent-deep/70">{step.n}</span>
                  <span className="mx-2 text-charcoal/25">/</span>
                  <span className="font-medium">{step.label}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-charcoal/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-charcoal/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
