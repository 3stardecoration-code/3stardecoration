"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** Points string for a 5-point star centered at (cx, cy). */
function starPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}

type Props = {
  /** While true, stars loop (draw → fill → dim → repeat). When it flips to
   * false, all three settle into a solid filled state once, then call onSettled. */
  loading: boolean;
  onSettled?: () => void;
};

/**
 * Hand-built Lottie-style vector loader: three stars draw their outline
 * (stroke-dashoffset), pop into a filled state, dim, and repeat in a
 * staggered loop — no external Lottie JSON/library, just GSAP + SVG.
 */
export function ThreeStarLoader({ loading, onSettled }: Props) {
  const starRefs = useRef<(SVGPolygonElement | null)[]>([]);
  const loopRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const stars = starRefs.current.filter((s): s is SVGPolygonElement => Boolean(s));
    if (stars.length === 0) return;

    const lengths = stars.map((s) => s.getTotalLength());
    stars.forEach((s, i) => {
      gsap.set(s, {
        strokeDasharray: lengths[i],
        strokeDashoffset: lengths[i],
        fillOpacity: 0,
        transformOrigin: "50% 50%",
        scale: 0.6,
        rotate: -18,
      });
    });

    const tl = gsap.timeline({ repeat: -1 });
    stars.forEach((s, i) => {
      const at = i * 0.18;
      tl.to(s, { strokeDashoffset: 0, duration: 0.55, ease: "power2.out" }, at)
        .to(s, { fillOpacity: 1, scale: 1, rotate: 0, duration: 0.4, ease: "back.out(2.4)" }, at + 0.35)
        .to(s, { fillOpacity: 0.18, strokeDashoffset: lengths[i] * 0.15, duration: 0.5, ease: "power1.inOut" }, at + 1.05);
    });
    tl.to({}, { duration: 0.35 });
    loopRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const stars = starRefs.current.filter((s): s is SVGPolygonElement => Boolean(s));
    loopRef.current?.pause();
    gsap.to(stars, {
      strokeDashoffset: 0,
      fillOpacity: 1,
      scale: 1,
      rotate: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.08,
      onComplete: () => onSettled?.(),
    });
  }, [loading, onSettled]);

  return (
    <div className="flex items-center gap-3" role="presentation">
      {[0, 1, 2].map((i) => (
        <svg key={i} width="26" height="26" viewBox="0 0 28 28" aria-hidden>
          <polygon
            ref={(el) => {
              starRefs.current[i] = el;
            }}
            points={starPoints(14, 14, 12, 5)}
            className="fill-accent stroke-accent"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}
