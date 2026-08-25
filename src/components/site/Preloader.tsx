"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ThreeStarLoader } from "./ThreeStarLoader";
import { Logo } from "./Logo";

/**
 * Luxury first-visit intro (spec §8.3). The page renders underneath immediately;
 * this overlay only fades over it, so it never blocks LCP and crawlers/no-JS see
 * full content. Shown once per session; skipped entirely for reduced motion.
 */
export function Preloader({ logoUrl }: { logoUrl?: string | null } = {}) {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("intro-seen")) return;

    document.body.style.overflow = "hidden";

    const start = performance.now();
    const duration = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setActive(true);
      // ease-out for the counter
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setLeaving(true);
        sessionStorage.setItem("intro-seen", "1");
        document.body.style.overflow = "";
        setTimeout(() => setActive(false), 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-espresso text-ivory"
      style={{
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.9s var(--ease-lux)",
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <div
        className="flex flex-col items-center gap-5"
        style={{
          transform: leaving ? "translateY(-8px)" : "translateY(0)",
          opacity: leaving ? 0 : 1,
          transition: "all 0.9s var(--ease-lux)",
        }}
      >
        <ThreeStarLoader loading={count < 100} />
        <div className="h-14">
          <Logo className="h-full w-auto" priority src={logoUrl} />
        </div>
      </div>
      <div className="mt-8 h-px w-40 overflow-hidden bg-ivory/15">
        <div
          className="h-full bg-accent"
          style={{ width: `${count}%`, transition: "width 0.1s linear" }}
        />
      </div>
      <span className="mt-4 text-xs tracking-[0.3em] text-ivory/50">{count}</span>
    </div>
  );
}
