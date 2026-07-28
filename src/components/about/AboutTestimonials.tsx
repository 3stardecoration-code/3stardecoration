import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Testimonial } from "@/lib/domain";

function StarRating({ rating }: { rating: number | null }) {
  const n = Math.min(5, Math.max(0, rating ?? 5));
  return (
    <p aria-label={`${n} out of 5 stars`} className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-sm ${i < n ? "text-accent" : "text-line"}`} aria-hidden>
          ★
        </span>
      ))}
    </p>
  );
}

type Props = { testimonials: Testimonial[] };

/**
 * Testimonials pull-through on the About page.
 * Three-column card grid on desktop; horizontal scroll on mobile.
 * Distinct from the homepage Testimonials section (dark bg) — uses ivory bg
 * with bordered cards to differentiate the About page visually.
 */
export function AboutTestimonials({ testimonials }: Props) {
  if (testimonials.length === 0) return null;
  const visible = testimonials.slice(0, 3);

  return (
    <section className="py-section">
      <Container>
        {/* Header */}
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">What clients say</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">In their own words.</h2>
          </div>
          <Link
            href="/portfolio"
            className="shrink-0 text-sm font-medium text-stone underline-offset-4 transition-colors hover:text-charcoal hover:underline"
          >
            See our work →
          </Link>
        </Reveal>

        {/* Card grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {visible.map((t, i) => (
            <Reveal
              key={t.id}
              delay={i * 0.08}
              as="article"
              className="flex flex-col rounded-2xl border border-line bg-porcelain p-8"
            >
              <StarRating rating={t.rating} />

              {/* Quote */}
              <blockquote className="mt-5 flex-1">
                <p className="font-[family-name:var(--font-display)] text-xl leading-snug text-charcoal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>

              {/* Author */}
              <footer className="mt-8 border-t border-line pt-5">
                <p className="text-sm font-medium text-charcoal">{t.author_name}</p>
                {t.event_type && (
                  <p className="mt-0.5 text-[0.72rem] uppercase tracking-[0.2em] text-stone">
                    {t.event_type}
                  </p>
                )}
              </footer>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
