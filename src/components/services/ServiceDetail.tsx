import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import type { Service, MediaAsset, SiteSettings } from "@/lib/domain";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = {
  service: Service;
  coverAsset?: MediaAsset;
  settings: SiteSettings;
};

export function ServiceDetail({ service, coverAsset, settings }: Props) {
  const wa = whatsappUrl(
    settings.whatsapp_number,
    `Hi 3 Star Decoration, I'm interested in your ${service.title} service. Could you share details and pricing?`,
  );

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] overflow-hidden bg-espresso text-ivory">
        {coverAsset && (
          <>
            <MediaImage
              asset={coverAsset}
              fill
              sizes="100vw"
              priority
              className="absolute inset-0 z-0 opacity-40"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-espresso/80 via-espresso/30 to-transparent" />
          </>
        )}
        <Container className="relative z-20 flex min-h-[60vh] flex-col justify-end pb-20 pt-40">
          <Reveal>
            <Link
              href="/services"
              className="mb-8 inline-flex items-center gap-2 text-sm text-ivory/60 transition-colors hover:text-ivory"
            >
              <span aria-hidden>←</span> All services
            </Link>
            <p className="eyebrow text-accent">Our services</p>
            <h1 className="display mt-4 text-5xl sm:text-6xl lg:text-7xl">{service.title}</h1>
            {service.short_description && (
              <p className="mt-6 max-w-xl text-lg text-ivory/75">{service.short_description}</p>
            )}
          </Reveal>
        </Container>
      </section>

      {/* Description body */}
      {service.description && (
        <section className="py-section">
          <Container>
            <div className="grid gap-16 lg:grid-cols-[1fr_360px] lg:gap-24">
              <Reveal>
                {/* description is sanitized HTML on write (spec §12). Mock fixtures are trusted. */}
                <div
                  className="prose prose-lg max-w-none leading-relaxed text-charcoal [&_p]:mt-5 [&_p:first-child]:mt-0 [&_p]:leading-relaxed [&_p]:text-stone"
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              </Reveal>

              {/* Sticky sidebar CTA */}
              <Reveal delay={0.12}>
                <div className="rounded-2xl border border-line bg-porcelain p-8 lg:sticky lg:top-28">
                  <p className="eyebrow">Ready to begin?</p>
                  <p className="display mt-4 text-3xl">Plan your event with us.</p>
                  <p className="mt-4 text-sm leading-relaxed text-stone">
                    Tell us about your occasion — we&apos;ll get back to you with ideas and pricing
                    tailored to your vision.
                  </p>
                  <div className="mt-8 flex flex-col gap-3">
                    <Link
                      href="/quote"
                      className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-accent-deep"
                    >
                      Get a quote <span aria-hidden>→</span>
                    </Link>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm font-medium text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {/* Full-width WhatsApp CTA (dark band) */}
      <section className="bg-espresso py-20 text-ivory sm:py-28">
        <Container className="text-center">
          <Reveal className="mx-auto max-w-2xl">
            <p className="eyebrow">Let&apos;s create something extraordinary</p>
            <p className="display mt-5 text-4xl sm:text-5xl">
              Your celebration, our canvas.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-ivory transition-colors hover:bg-accent-deep"
              >
                Get a free quote <span aria-hidden>→</span>
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-ivory/35 px-8 py-4 text-sm font-medium text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
              >
                Chat on WhatsApp
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Back to services */}
      <nav className="border-t border-line" aria-label="Service navigation">
        <Container className="py-10">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-charcoal"
          >
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:-translate-x-1"
            >
              ←
            </span>
            Back to all services
          </Link>
        </Container>
      </nav>
    </>
  );
}
