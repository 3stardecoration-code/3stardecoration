import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import type { MediaAsset, Testimonial } from "@/lib/domain";

function Stars({ rating }: { rating: number | null }) {
  const n = rating ?? 5;
  return (
    <span className="text-xs tracking-[0.3em] text-accent" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
    </span>
  );
}

type Props = { items: Testimonial[]; background?: MediaAsset };

export function Testimonials({ items, background }: Props) {
  const shown = items.slice(0, 3);

  return (
    <section className="relative overflow-hidden py-section text-ivory">
      <div className="absolute inset-0">
        {background && <MediaImage asset={background} fill sizes="100vw" />}
        <div className="absolute inset-0 bg-charcoal/75" />
      </div>

      <Container className="relative">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="eyebrow">Kind Words</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">Loved, one celebration at a time</h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {shown.map((t, i) => (
            <Reveal key={t.id} as="article" delay={i * 0.12}>
              <div className="flex h-full flex-col gap-5 rounded-2xl border border-ivory/15 bg-ivory/[0.07] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-transform duration-500 ease-[var(--ease-lux)] hover:-translate-y-1.5">
                <Stars rating={t.rating} />
                <p className="font-[family-name:var(--font-display)] text-lg italic leading-snug text-ivory/95">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto border-t border-ivory/15 pt-5">
                  <p className="text-sm font-medium">{t.author_name}</p>
                  {t.event_type && (
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-ivory/55">
                      {t.event_type}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
