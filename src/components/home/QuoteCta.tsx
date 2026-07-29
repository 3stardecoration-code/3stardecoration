import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { whatsappUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/domain";

export function QuoteCta({ settings }: { settings: SiteSettings }) {
  const wa = whatsappUrl(
    settings.whatsapp_number,
    "Hi 3 Star Decoration, I'd like a quote for my event.",
  );

  return (
    <section className="relative overflow-hidden bg-charcoal text-ivory">
      {/* soft gold aura */}
      <div
        className="pointer-events-none absolute -top-1/2 left-1/2 h-[130%] w-[80%] -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 60%)" }}
      />
      <Container className="relative py-32 text-center sm:py-44">
        <Reveal className="mx-auto max-w-4xl">
          <p className="eyebrow">Let&apos;s Begin</p>
          <p className="display mt-7 text-[12vw] leading-[0.96] sm:text-8xl">
            Your unforgettable
            <br />
            <span className="italic text-accent">day awaits.</span>
          </p>

          <div className="mt-12 flex flex-col items-center gap-5">
            <Magnetic strength={0.25}>
              <Link
                href="/quote"
                className="inline-flex items-center gap-3 rounded-full bg-accent px-9 py-4 text-sm font-medium tracking-wide text-charcoal transition-colors duration-300 hover:bg-ivory"
              >
                Begin the conversation <span aria-hidden>→</span>
              </Link>
            </Magnetic>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="text-xs uppercase tracking-[0.25em] text-ivory/50 transition-colors hover:text-ivory"
            >
              or message us on WhatsApp
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
