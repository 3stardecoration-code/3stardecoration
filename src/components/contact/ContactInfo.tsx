import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { whatsappUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/domain";

type Props = { settings: SiteSettings };

// Inline SVG icons — no icon library dependency
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-6 w-6">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91A16 16 0 0 0 15.1 16.1l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-6 w-6">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-6 w-6">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

/**
 * Contact info section — phone, email, address in card columns,
 * WhatsApp CTA, social links, and optional Google Map embed.
 */
export function ContactInfo({ settings }: Props) {
  const wa = whatsappUrl(
    settings.whatsapp_number,
    "Hi 3 Star Decoration, I'd like to get in touch about my event.",
  );

  const infoCards = [
    settings.business_phone && {
      icon: <PhoneIcon />,
      label: "Phone",
      value: settings.business_phone,
      href: `tel:${settings.business_phone}`,
    },
    settings.business_email && {
      icon: <MailIcon />,
      label: "Email",
      value: settings.business_email,
      href: `mailto:${settings.business_email}`,
    },
    settings.address && {
      icon: <MapPinIcon />,
      label: "Location",
      value: settings.address,
      href: null,
    },
  ].filter(Boolean) as Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
    href: string | null;
  }>;

  const socials = Object.entries(settings.social_links ?? {}).filter(([, v]) => v);

  return (
    <section className="py-section">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_420px] lg:gap-24">
          {/* Left: info cards + socials + WhatsApp */}
          <div>
            <Reveal>
              <p className="eyebrow">Contact details</p>
              <h2 className="display mt-4 text-4xl sm:text-5xl">Reach us any way you like.</h2>
            </Reveal>

            {/* Info cards */}
            <div className="mt-10 flex flex-col gap-4">
              {infoCards.map((card) => (
                <Reveal key={card.label} y={16}>
                  <div className="flex items-start gap-5 rounded-2xl border border-line bg-porcelain p-6 transition-colors hover:border-accent/40">
                    <span className="mt-0.5 shrink-0 text-accent">{card.icon}</span>
                    <div>
                      <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-stone">
                        {card.label}
                      </p>
                      {card.href ? (
                        <a
                          href={card.href}
                          className="mt-1 text-[0.98rem] font-medium text-charcoal transition-colors hover:text-accent"
                        >
                          {card.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-[0.98rem] font-medium text-charcoal">{card.value}</p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* WhatsApp CTA */}
            {settings.whatsapp_number && (
              <Reveal delay={0.1} y={16}>
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 flex items-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <WhatsAppIcon />
                  Chat on WhatsApp — quickest response
                </a>
              </Reveal>
            )}

            {/* Social links */}
            {socials.length > 0 && (
              <Reveal delay={0.15} y={16}>
                <div className="mt-8">
                  <p className="eyebrow mb-4">Follow us</p>
                  <div className="flex flex-wrap gap-3">
                    {socials.map(([name, href]) => (
                      <a
                        key={name}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-line px-5 py-2 text-[0.78rem] font-medium capitalize tracking-wide text-charcoal transition-colors hover:border-accent hover:text-accent"
                      >
                        {name}
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* Right: Google Map embed + Quote CTA card */}
          <div className="flex flex-col gap-6">
            {/* Google Map embed (optional — only rendered if set in settings) */}
            {settings.google_map_embed && (
              <Reveal y={24}>
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-line">
                  <iframe
                    src={settings.google_map_embed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="3 Star Decoration location map"
                  />
                </div>
              </Reveal>
            )}

            {/* Quote CTA card */}
            <Reveal delay={0.1} y={24}>
              <div className="rounded-2xl bg-espresso p-8 text-ivory">
                <p className="eyebrow text-accent">Ready to plan?</p>
                <h3 className="display mt-3 text-3xl">Tell us about your event.</h3>
                <p className="mt-4 text-sm leading-relaxed text-ivory/65">
                  Our quote form takes 2 minutes. Fill it in and we&apos;ll get back to you with
                  ideas and a proposal — usually within the same day.
                </p>
                <Link
                  href="/quote"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-accent-deep"
                >
                  Get a free quote <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
