import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { AboutPageContent } from "@/lib/domain";

type Props = Pick<AboutPageContent, "hero_eyebrow" | "hero_title" | "hero_description">;

/**
 * Hero section for /about.
 * Dark espresso background, editorial line-mask headline reveal.
 * Same motion pattern as ServicesHero — consistent across all listing-level pages.
 */
export function AboutHero({ hero_eyebrow, hero_title, hero_description }: Props) {
  const lines = hero_title.split("\n").filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-espresso pb-24 pt-40 text-ivory sm:pt-48">
      {/* Subtle noise grain for premium depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Decorative gold accent line */}
      <div aria-hidden className="rule-gold absolute left-0 right-0 top-0 opacity-60" />

      <Container className="relative">
        <Reveal>
          <p className="eyebrow text-accent">{hero_eyebrow}</p>
        </Reveal>

        <h1 className="display mt-5 max-w-3xl text-5xl leading-none sm:text-6xl lg:text-7xl">
          {lines.map((line, i) => (
            <span key={i} className="line-mask">
              <span
                style={{
                  display: "block",
                  animationName: "about-slide-up",
                  animationDuration: "1.1s",
                  animationTimingFunction: "var(--ease-lux)",
                  animationFillMode: "both",
                  animationDelay: `${0.1 + i * 0.12}s`,
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <Reveal delay={0.4} y={20}>
          <p className="mt-8 max-w-xl text-[0.98rem] leading-relaxed text-ivory/70">
            {hero_description}
          </p>
        </Reveal>
      </Container>

      {/* Bottom fade into ivory page canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{ background: "linear-gradient(to bottom, transparent, var(--color-ivory))" }}
      />

      <style>{`
        @keyframes about-slide-up {
          from { transform: translateY(110%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
