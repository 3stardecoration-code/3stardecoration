import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import type { MediaAsset, Service } from "@/lib/domain";

type Props = {
  services: Service[];
  media: Record<string, MediaAsset>;
};

// Curated subset, not the full catalogue — "less content, more visuals."
const FEATURED_SLUGS = ["wedding-decoration", "reception-styling", "corporate-events", "stage-backdrop-design"];

export function ServicesPreview({ services, media }: Props) {
  const items = FEATURED_SLUGS.map((slug) => services.find((s) => s.slug === slug)).filter(
    (s): s is Service => Boolean(s),
  );
  if (items.length === 0) return null;

  return (
    <section className="bg-porcelain py-section">
      <Container>
        <Reveal className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">What We Create</p>
            <h2 className="display mt-4 text-5xl sm:text-6xl">Design, by occasion</h2>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-charcoal"
          >
            All services
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </Link>
        </Reveal>
      </Container>

      <div>
        {items.map((service, i) => {
          const cover = service.media_asset_id ? media[service.media_asset_id] : undefined;
          const reversed = i % 2 === 1;
          return (
            <Reveal key={service.id} y={30}>
              <Link
                href="/services"
                className={`group grid grid-cols-1 items-stretch lg:grid-cols-2 ${
                  reversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-line lg:aspect-auto">
                  {cover && (
                    <MediaImage
                      asset={cover}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      imgClassName="transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.06]"
                    />
                  )}
                </div>
                <div className="flex items-center bg-porcelain px-6 py-16 sm:px-12 lg:px-16">
                  <div className="max-w-md">
                    <p className="eyebrow">{service.short_description ? "Signature Service" : ""}</p>
                    <h3 className="display mt-4 text-4xl sm:text-5xl">{service.title}</h3>
                    {service.short_description && (
                      <p className="mt-5 text-[0.95rem] leading-relaxed text-stone">
                        {service.short_description}
                      </p>
                    )}
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-charcoal">
                      Discover
                      <span
                        className="transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
