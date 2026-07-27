"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Vertical offset the element rises from. */
  y?: number;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header";
};

/**
 * Fade-and-rise on scroll into view, via IntersectionObserver (reliable
 * regardless of the scroll mechanism). Fully visible immediately when the
 * user prefers reduced motion.
 */
export function Reveal({ children, className, y = 28, delay = 0, as = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);
  const visible = shown || reduced;

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${y}px)`,
        transition: `opacity 0.9s var(--ease-lux) ${delay}s, transform 0.9s var(--ease-lux) ${delay}s`,
      }}
    >
      {children}
    </Tag>
  );
}
