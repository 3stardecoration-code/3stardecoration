import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    number: "01",
    title: "Consultation",
    description:
      "We start with a conversation — your vision, venue, guest count, and palette. No forms, no templates. Just listening.",
  },
  {
    number: "02",
    title: "Design & Proposal",
    description:
      "Our team sketches a custom mood board and itemised proposal. Every element is chosen deliberately — nothing filler.",
  },
  {
    number: "03",
    title: "Setup & Styling",
    description:
      "On the day, our crew arrives early and works quietly. By the time guests arrive, every detail is placed and perfect.",
  },
  {
    number: "04",
    title: "Handover & Wrap",
    description:
      "You celebrate. We handle all post-event dismantle and cleanup — leaving the venue exactly as we found it.",
  },
];

/**
 * "How we work" process section — four numbered steps in an editorial grid.
 * Porcelain background for contrast against the ivory page canvas.
 */
export function AboutProcess() {
  return (
    <section className="bg-porcelain py-section">
      <Container>
        {/* Section header */}
        <Reveal className="max-w-xl">
          <p className="eyebrow">How we work</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">Simple process. Extraordinary results.</h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-stone">
            From first conversation to final bow — our process is designed to be effortless for
            you and meticulous behind the scenes.
          </p>
        </Reveal>

        {/* Steps — two columns on desktop */}
        <div className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.number}
              delay={(i % 2) * 0.08}
              as="article"
              className="group bg-porcelain p-8 transition-colors duration-300 hover:bg-ivory sm:p-10"
            >
              {/* Large number glyph */}
              <p
                className="font-[family-name:var(--font-display)] text-[5rem] font-light leading-none text-line transition-colors duration-300 group-hover:text-accent/30 sm:text-[6rem]"
                aria-hidden
              >
                {step.number}
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
