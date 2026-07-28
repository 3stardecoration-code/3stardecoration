import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Top-of-page hero for /services.
 * Line-mask reveal on h1, fade-up on supporting copy — matches Portfolio hero.
 */
export function ServicesHero() {
  return (
    <section className="relative overflow-hidden bg-espresso pb-24 pt-40 text-ivory sm:pt-48">
      {/* Subtle grain overlay for luxury depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      <Container className="relative">
        <Reveal>
          <p className="eyebrow text-accent">What we create</p>
        </Reveal>

        <h1 className="display mt-5 max-w-3xl text-5xl leading-none sm:text-6xl lg:text-7xl">
          <span className="line-mask">
            <span
              style={{
                display: "block",
                animationName: "slide-up",
                animationDuration: "1.1s",
                animationTimingFunction: "var(--ease-lux)",
                animationFillMode: "both",
                animationDelay: "0.1s",
              }}
            >
              Every celebration,
            </span>
          </span>
          <span className="line-mask">
            <span
              style={{
                display: "block",
                animationName: "slide-up",
                animationDuration: "1.1s",
                animationTimingFunction: "var(--ease-lux)",
                animationFillMode: "both",
                animationDelay: "0.22s",
              }}
            >
              beautifully designed.
            </span>
          </span>
        </h1>

        <Reveal delay={0.4} y={20}>
          <p className="mt-8 max-w-xl text-[0.98rem] leading-relaxed text-ivory/70">
            From intimate gatherings to grand stages — we bring a single, considered aesthetic to
            every kind of occasion. Browse our full range of event decoration services below.
          </p>
        </Reveal>
      </Container>

      {/* Decorative bottom fade into page canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{ background: "linear-gradient(to bottom, transparent, var(--color-ivory))" }}
      />

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(110%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
