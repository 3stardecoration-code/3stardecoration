import Link from "next/link";
import type { SiteSettings } from "@/lib/domain";
import { Container } from "@/components/ui/Container";
import { whatsappUrl } from "@/lib/whatsapp";

const NAV = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/quote", label: "Get a Quote" },
];

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const wa = whatsappUrl(
    settings.whatsapp_number,
    "Hi 3 Star Decoration, I'd love to talk about my event.",
  );
  const socials = Object.entries(settings.social_links ?? {}).filter(([, v]) => v);

  return (
    <footer className="bg-espresso text-ivory">
      <Container className="py-20">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="flex items-baseline gap-2 font-[family-name:var(--font-display)] text-2xl">
              <span className="text-accent">✦</span> 3 Star <span className="italic">Decoration</span>
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ivory/60">
              Cinematic, luxury event decoration — weddings, receptions, and every celebration
              in between, designed to be unforgettable.
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-accent transition-opacity hover:opacity-80"
            >
              Chat on WhatsApp
              <span aria-hidden>→</span>
            </a>
          </div>

          <nav className="flex flex-col gap-3">
            <p className="eyebrow mb-2">Explore</p>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ivory/70 transition-colors hover:text-ivory"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <p className="eyebrow mb-2">Get in touch</p>
            {settings.business_phone && (
              <a href={`tel:${settings.business_phone}`} className="text-sm text-ivory/70 hover:text-ivory">
                {settings.business_phone}
              </a>
            )}
            {settings.business_email && (
              <a href={`mailto:${settings.business_email}`} className="text-sm text-ivory/70 hover:text-ivory">
                {settings.business_email}
              </a>
            )}
            {settings.address && <p className="text-sm text-ivory/70">{settings.address}</p>}
            {socials.length > 0 && (
              <div className="mt-3 flex gap-4">
                {socials.map(([name, href]) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs uppercase tracking-widest text-ivory/60 hover:text-accent"
                  >
                    {name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ivory/10 pt-8 text-xs text-ivory/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} 3 Star Decoration. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-ivory/80">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ivory/80">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
