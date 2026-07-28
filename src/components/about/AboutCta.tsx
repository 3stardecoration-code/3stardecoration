import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { whatsappUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/domain";

type Props = { settings: SiteSettings };

/**
 * Call-to-action section at the bottom of /about.
 * Ivory background so it reads as the natural page close before the footer.
 * Two actions: primary (Get a Quote) + secondary (WhatsApp).
 */
export function AboutCta({ settings }: Props) {
  const wa = whatsappUrl(
    settings.whatsapp_number,
    "Hi 3 Star Decoration, I'd like to discuss decorating my event. Could you help?",
  );

  return (
    <section className="border-t border-line py-section">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          {/* Decorative star */}
          <span className="text-3xl text-accent" aria-hidden>
            ✦
          </span>

          <p className="eyebrow mt-6">Ready to begin?</p>

          <h2 className="display mt-5 text-4xl sm:text-5xl lg:text-6xl">
            Let&apos;s plan your celebration together.
          </h2>

          <p className="mt-6 text-[0.98rem] leading-relaxed text-stone">
            Tell us about your event — we&apos;ll bring the vision, the florals, the lighting, and
            everything in between. No two events are the same, and we wouldn&apos;t have it any
            other way.
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-4 text-sm font-medium text-ivory transition-colors duration-300 hover:bg-espresso"
            >
              Get a free quote <span aria-hidden>→</span>
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-charcoal px-8 py-4 text-sm font-medium text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-ivory"
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* Contact details strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[0.78rem] text-stone">
            {settings.business_phone && (
              <a
                href={`tel:${settings.business_phone}`}
                className="flex items-center gap-1.5 transition-colors hover:text-charcoal"
              >
                <span aria-hidden>📞</span> {settings.business_phone}
              </a>
            )}
            {settings.business_email && (
              <a
                href={`mailto:${settings.business_email}`}
                className="flex items-center gap-1.5 transition-colors hover:text-charcoal"
              >
                <span aria-hidden>✉</span> {settings.business_email}
              </a>
            )}
            {settings.address && (
              <span className="flex items-center gap-1.5">
                <span aria-hidden>📍</span> {settings.address}
              </span>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
