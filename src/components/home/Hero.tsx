"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Magnetic } from "@/components/ui/Magnetic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { HeroBanner } from "@/lib/domain";

type Props = { banner: HeroBanner };

export function Hero({ banner }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const firstVisit = typeof window !== "undefined" && !sessionStorage.getItem("intro-seen");
    const ctx = gsap.context(() => {
      gsap.set(".hero-line > span", { yPercent: 115 });
      gsap.set(".hero-fade", { opacity: 0, y: 18 });
      gsap.set(".hero-bloom", { opacity: 0, scale: 0.85 });
      const tl = gsap.timeline({ delay: firstVisit ? 1 : 0.2 });
      tl.to(".hero-bloom", { opacity: 1, scale: 1, duration: 2, ease: "power2.out", stagger: 0.15 }, 0)
        .to(".hero-line > span", { yPercent: 0, duration: 1.2, ease: "power3.out", stagger: 0.1 }, 0.35)
        .to(".hero-fade", { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.12 }, "-=0.6");

      // Ambient drift — the pastel washes breathe slowly, forever.
      gsap.to(".hero-bloom-1", { x: 24, y: -18, duration: 22, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".hero-bloom-2", { x: -20, y: 22, duration: 26, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1 });
      gsap.to(".hero-bloom-3", { x: 16, y: 16, duration: 19, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.5 });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const title = banner.title ?? "Celebrations, beautifully designed";
  const words = title.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines = [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter(Boolean);

  return (
    <section
      ref={root}
      className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-ivory"
    >
      {/* Decorative pastel washes — the hero's only "imagery": soft, blurred
          color blooms standing in for a photograph. Unique to this section. */}
      <div
        aria-hidden
        className="hero-bloom hero-bloom-1 pointer-events-none absolute -left-[12%] -top-[18%] h-[52vw] w-[52vw] max-h-[620px] max-w-[620px] rounded-full bg-blush blur-[100px]"
      />
      <div
        aria-hidden
        className="hero-bloom hero-bloom-2 pointer-events-none absolute -bottom-[22%] -right-[12%] h-[58vw] w-[58vw] max-h-[680px] max-w-[680px] rounded-full bg-sage blur-[110px]"
      />
      <div
        aria-hidden
        className="hero-bloom hero-bloom-3 pointer-events-none absolute right-[8%] top-[6%] h-[26vw] w-[26vw] max-h-[320px] max-w-[320px] rounded-full bg-mist blur-[90px] opacity-80"
      />

      {/* Decorative line-art wreath framing the headline */}
      <HeroWreath className="hero-bloom pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[92%] max-w-4xl -translate-x-1/2 -translate-y-1/2 text-accent/40 sm:h-[105%]" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center sm:px-8">
        {banner.eyebrow && <p className="hero-fade eyebrow mb-7 text-accent-deep">{banner.eyebrow}</p>}

        <h1 className="display max-w-2xl text-[12vw] leading-[0.98] text-charcoal sm:text-7xl lg:text-8xl">
          {lines.map((line, i) => (
            <span key={i} className="line-mask hero-line">
              <span className={i === lines.length - 1 ? "italic text-accent-deep" : ""}>{line}</span>
            </span>
          ))}
        </h1>

        {banner.subtitle && (
          <p className="hero-fade mt-7 max-w-sm text-[0.95rem] font-light tracking-wide text-stone">
            {banner.subtitle}
          </p>
        )}

        <div className="hero-fade mt-10">
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
      </div>

      <div className="hero-fade absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-[0.6rem] uppercase tracking-[0.35em] text-stone">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-charcoal/15">
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

/** Thin line-art wreath, drawn (not photographed) — the hero's decorative signature. */
function HeroWreath({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
    >
      {/* Left arc + sprigs */}
      <path d="M40 250c0-95 60-175 150-205" />
      <path d="M70 130c10-8 26-10 36-2M62 160c11-6 27-5 36 4M58 192c12-4 27 0 34 10" />
      {/* Right arc + sprigs */}
      <path d="M560 250c0-95-60-175-150-205" />
      <path d="M530 130c-10-8-26-10-36-2M538 160c-11-6-27-5-36 4M542 192c-12-4-27 0-34 10" />
      {/* Base sprigs, left */}
      <path d="M120 420c-14 6-30 4-40-6M108 440c-15 3-30-2-38-13" />
      {/* Base sprigs, right */}
      <path d="M480 420c14 6 30 4 40-6M492 440c15 3 30-2 38-13" />
      {/* Small blossom marks */}
      <circle cx="106" cy="120" r="3" />
      <circle cx="494" cy="120" r="3" />
      <circle cx="98" cy="452" r="3" />
      <circle cx="502" cy="452" r="3" />
    </svg>
  );
}
