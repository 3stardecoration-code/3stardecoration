import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Hero for /quote — ivory background (approachable, form context),
 * contrasting with the dark heroes on other listing pages.
 */
export function QuoteHero() {
  return (
    <section className="border-b border-line bg-porcelain pb-14 pt-36 sm:pt-44">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Free quote</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl">
            Tell us about your celebration.
          </h1>
          <p className="mt-6 text-[0.98rem] leading-relaxed text-stone">
            Fill in the form below — takes about 2 minutes. We&apos;ll review it and open a
            WhatsApp conversation with you so we can plan the details together. No obligation,
            no hard sell.
          </p>

          {/* Process steps */}
          <ol className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-8" aria-label="How it works">
            {[
              { n: "1", label: "Fill the form" },
              { n: "2", label: "WhatsApp opens" },
              { n: "3", label: "We plan together" },
            ].map((step) => (
              <li key={step.n} className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[0.7rem] font-medium text-ivory"
                  aria-hidden
                >
                  {step.n}
                </span>
                <span className="text-sm text-charcoal">{step.label}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}
