import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { whatsappUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/domain";

export function QuoteCta({ settings }: { settings: SiteSettings }) {
  const wa = whatsappUrl(
    settings.whatsapp_number,
    "Hi 3 Star Decoration, I'd like a quote for my event.",
  );

  return (
    <section className="relative overflow-hidden bg-espresso text-ivory">
      {/* soft gold aura */}
      <div
        className="pointer-events-none absolute -top-1/2 left-1/2 h-[120%] w-[70%] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 60%)" }}
      />
      <Container className="relative py-24 text-center sm:py-32">
        <Reveal className="mx-auto max-w-3xl">
          <p className="eyebrow">Let&apos;s begin</p>
          <p className="display mt-6 text-4xl sm:text-6xl">
            Tell us about the celebration you&apos;re dreaming of.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-ivory transition-colors duration-300 hover:bg-accent-deep"
            >
              Get a quote <span aria-hidden>→</span>
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-ivory/35 px-8 py-4 text-sm font-medium text-ivory transition-colors duration-300 hover:border-ivory hover:bg-ivory/10"
            >
              Chat on WhatsApp
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
