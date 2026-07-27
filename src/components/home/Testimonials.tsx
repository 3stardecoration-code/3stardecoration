import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Testimonial } from "@/lib/domain";

function Stars({ rating }: { rating: number | null }) {
  const n = rating ?? 5;
  return (
    <span className="text-sm tracking-[0.3em] text-accent" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
    </span>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  const shown = items.slice(0, 3);
  return (
    <section className="bg-espresso py-section text-ivory">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Kind words</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">
            Loved by the people who trusted us with their day
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {shown.map((t, i) => (
            <Reveal key={t.id} as="article" delay={i * 0.1} className="flex flex-col gap-5">
              <Stars rating={t.rating} />
              <p className="font-[family-name:var(--font-display)] text-xl leading-snug text-ivory/90">
                “{t.quote}”
              </p>
              <div className="mt-auto border-t border-ivory/10 pt-5">
                <p className="text-sm font-medium">{t.author_name}</p>
                {t.event_type && (
                  <p className="mt-1 text-xs uppercase tracking-widest text-ivory/50">
                    {t.event_type}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
