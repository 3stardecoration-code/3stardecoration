import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The one text-only beat in the homepage's visual rhythm — a deliberate pause
 * between photography-heavy sections. Two contrasting lines carry the whole
 * brand thesis: emptiness, then transformation.
 */
export function SignatureStatement() {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal y={20}>
            <p className="display text-2xl text-stone sm:text-3xl">An empty room.</p>
          </Reveal>
          <Reveal y={24} delay={0.15}>
            <p className="display mt-2 text-[9vw] italic leading-[0.95] text-charcoal sm:text-[4.5rem]">
              Then, everything <span className="text-accent">you imagined.</span>
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
