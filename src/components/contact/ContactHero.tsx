import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Hero section for /contact.
 * Consistent dark-espresso pattern with all other listing-level pages.
 */
export function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-espresso pb-24 pt-40 text-ivory sm:pt-48">
      {/* Grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />
      <div aria-hidden className="rule-gold absolute left-0 right-0 top-0 opacity-60" />

      <Container className="relative">
        <Reveal>
          <p className="eyebrow text-accent">Get in touch</p>
        </Reveal>

        <h1 className="display mt-5 max-w-3xl text-5xl leading-none sm:text-6xl lg:text-7xl">
          <span className="line-mask">
            <span
              style={{
                display: "block",
                animationName: "contact-slide-up",
                animationDuration: "1.1s",
                animationTimingFunction: "var(--ease-lux)",
                animationFillMode: "both",
                animationDelay: "0.1s",
              }}
            >
              We&apos;d love to hear
            </span>
          </span>
          <span className="line-mask">
            <span
              style={{
                display: "block",
                animationName: "contact-slide-up",
                animationDuration: "1.1s",
                animationTimingFunction: "var(--ease-lux)",
                animationFillMode: "both",
                animationDelay: "0.22s",
              }}
            >
              about your event.
            </span>
          </span>
        </h1>

        <Reveal delay={0.4} y={20}>
          <p className="mt-8 max-w-xl text-[0.98rem] leading-relaxed text-ivory/70">
            Whether you have a vision or just a date in mind — reach out and we&apos;ll make it
            happen. We respond within 24 hours, usually much faster.
          </p>
        </Reveal>
      </Container>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{ background: "linear-gradient(to bottom, transparent, var(--color-ivory))" }}
      />

      <style>{`
        @keyframes contact-slide-up {
          from { transform: translateY(110%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
