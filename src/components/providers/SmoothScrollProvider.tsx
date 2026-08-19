"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const onRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // Next.js's App Router doesn't full-page-reload between routes, so Lenis
  // (which owns its own virtual scroll position independent of the
  // browser's native one) keeps whatever offset the previous page was at —
  // a new page would otherwise render "scrolled" to the middle instead of
  // the top. Force it back to 0 on every route change.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (reduced) window.scrollTo(0, 0);
  }, [pathname, reduced]);

  return <>{children}</>;
}
