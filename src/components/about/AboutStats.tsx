"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Container } from "@/components/ui/Container";

const STATS = [
  { value: 10, suffix: "+", label: "Years of craft", sublabel: "Founded 2014" },
  { value: 500, suffix: "+", label: "Events decorated", sublabel: "And counting" },
  { value: 15, suffix: "", label: "Cities served", sublabel: "Across Tamil Nadu" },
  { value: 100, suffix: "%", label: "5-star reviews", sublabel: "Client satisfaction" },
];

/** Counts from 0 to `target` over `duration` ms, easing out. */
function useCountUp(target: number, duration = 1800, trigger: boolean) {
  const reduced = usePrefersReducedMotion();
  // When reduced-motion is active, start at the final value immediately —
  // this avoids calling setState synchronously inside the effect body.
  const [count, setCount] = useState(() => (reduced ? target : 0));

  useEffect(() => {
    if (!trigger || reduced) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger, reduced]);

  return count;
}

function StatCard({
  value,
  suffix,
  label,
  sublabel,
  delay,
  trigger,
}: {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
  delay: number;
  trigger: boolean;
}) {
  const count = useCountUp(value, 1800, trigger);

  return (
    <div
      className="flex flex-col items-center py-10 text-center transition-all duration-700"
      style={{
        opacity: trigger ? 1 : 0,
        transform: trigger ? "none" : "translateY(24px)",
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "var(--ease-lux)",
      }}
    >
      {/* Big counter */}
      <p
        className="font-[family-name:var(--font-display)] text-6xl font-light leading-none text-ivory sm:text-7xl"
        aria-live="polite"
        aria-label={`${value}${suffix} ${label}`}
      >
        {count}
        <span className="text-accent">{suffix}</span>
      </p>

      {/* Label */}
      <p className="mt-4 text-sm font-medium uppercase tracking-[0.22em] text-ivory/80">{label}</p>
      <p className="mt-1 text-[0.72rem] text-ivory/40">{sublabel}</p>
    </div>
  );
}

/**
 * Full-width espresso dark strip with animated counting statistics.
 * Count-up triggers once when the section scrolls into view.
 * Respects prefers-reduced-motion — shows final value immediately if set.
 */
export function AboutStats() {
  const ref = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTriggered(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-espresso py-4">
      <Container>
        {/* Section header */}
        <div
          className="border-b border-ivory/10 pb-10 pt-16 text-center transition-all duration-700"
          style={{
            opacity: triggered ? 1 : 0,
            transform: triggered ? "none" : "translateY(20px)",
            transitionTimingFunction: "var(--ease-lux)",
          }}
        >
          <p className="eyebrow text-accent">By the numbers</p>
          <h2 className="display mt-3 text-3xl text-ivory sm:text-4xl">
            A decade of celebrations
          </h2>
        </div>

        {/* Stat grid — dividers between cells */}
        <div className="grid grid-cols-2 divide-x divide-y divide-ivory/10 lg:grid-cols-4 lg:divide-y-0">
          {STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              sublabel={stat.sublabel}
              delay={i * 0.1}
              trigger={triggered}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
