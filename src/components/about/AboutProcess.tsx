import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { AboutProcessStep } from "@/lib/domain";

type Props = { eyebrow: string; title: string; description: string; steps: AboutProcessStep[] };

/**
 * "How we work" process section — four numbered steps in an editorial grid.
 * Porcelain background for contrast against the ivory page canvas.
 */
export function AboutProcess({ eyebrow, title, description, steps }: Props) {
  return (
    <section className="bg-porcelain py-section">
      <Container>
        {/* Section header */}
        <Reveal className="max-w-xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">{title}</h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-stone">{description}</p>
        </Reveal>

        {/* Steps — two columns on desktop */}
        <div className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2">
          {steps.map((step, i) => (
            <Reveal
              key={`${step.title}-${i}`}
              delay={(i % 2) * 0.08}
              as="article"
              className="group bg-porcelain p-8 transition-colors duration-300 hover:bg-ivory sm:p-10"
            >
              {/* Large number glyph */}
              <p
                className="font-[family-name:var(--font-display)] text-[5rem] font-light leading-none text-line transition-colors duration-300 group-hover:text-accent/30 sm:text-[6rem]"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </p>

              {/* Thin accent rule */}
              <div className="rule-gold my-6 w-10 transition-all duration-500 group-hover:w-20" />

              <h3 className="font-[family-name:var(--font-display)] text-2xl">{step.title}</h3>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-stone">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
