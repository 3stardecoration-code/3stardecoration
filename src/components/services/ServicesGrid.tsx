import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import type { Service } from "@/lib/domain";
import type { MediaAsset } from "@/lib/domain";

// Map service slugs to a contextual icon SVG path (inline, no icon library dependency).
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "wedding-decoration": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="h-7 w-7">
      <path d="M12 21.7C5.4 17 2 12.5 2 8.5a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-3.4 8.5-10 13.2z" />
    </svg>
  ),
  "reception-styling": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="h-7 w-7">
      <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2m-4 0H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h8m4 0V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2m6 5h.01" />
    </svg>
  ),
  "engagement-setups": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="h-7 w-7">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  ),
  "birthday-baby-shower": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="h-7 w-7">
      <path d="M12 2c0 3-2 3-2 6a2 2 0 0 0 4 0c0-3-2-3-2-6z" />
      <path d="M5 9c0 3-2 3-2 6a2 2 0 0 0 4 0c0-3-2-3-2-6z" />
      <path d="M19 9c0 3-2 3-2 6a2 2 0 0 0 4 0c0-3-2-3-2-6z" />
      <path d="M3 19h18v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" />
    </svg>
  ),
};

// Fallback icon — generic sparkles/star
const FallbackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="h-7 w-7">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

type Props = {
  services: Service[];
  coverMedia: Record<string, MediaAsset>;
};

export function ServicesGrid({ services, coverMedia }: Props) {
  return (
    <section className="py-section">
      <Container>
        {/* Section intro */}
        <Reveal className="max-w-xl">
          <p className="eyebrow">Full range</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">Everything we offer</h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-stone">
            Four specialities, one unified aesthetic. Every service is delivered with the same
            attention to detail — whether intimate or grand.
          </p>
        </Reveal>

        {/* Service cards grid */}
        <div className="mt-16 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const icon = SERVICE_ICONS[service.slug] ?? <FallbackIcon />;
            const cover = service.media_asset_id ? coverMedia[service.media_asset_id] : undefined;

            return (
              <Reveal key={service.id} delay={(i % 3) * 0.06}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden bg-porcelain p-8 transition-colors duration-500 hover:bg-charcoal"
                >
                  {/* Background image (if cover set via CMS) */}
                  {cover && (
                    <>
                      <MediaImage
                        asset={cover}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="absolute inset-0 z-0 opacity-30 transition-opacity duration-500 group-hover:opacity-50"
                      />
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-espresso/90 via-espresso/40 to-transparent" />
                    </>
                  )}

                  {/* Accent rule — grows on hover */}
                  <span
                    aria-hidden
                    className="absolute left-8 top-8 h-px w-8 bg-accent transition-all duration-500 group-hover:w-16"
                  />

                  {/* Icon */}
                  <div
                    className={`relative z-20 mb-auto mt-14 text-accent transition-colors duration-300 ${cover ? "" : "group-hover:text-ivory/80"}`}
                  >
                    {icon}
                  </div>

                  {/* Title + short description */}
                  <div className="relative z-20 mt-8">
                    <h3
                      className={`font-[family-name:var(--font-display)] text-2xl transition-colors duration-300 group-hover:text-ivory sm:text-3xl`}
                    >
                      {service.title}
                    </h3>
                    {service.short_description && (
                      <p
                        className={`mt-3 line-clamp-2 text-sm leading-relaxed text-stone transition-colors duration-300 group-hover:text-ivory/60`}
                      >
                        {service.short_description}
                      </p>
                    )}
                    <span
                      className={`mt-5 inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-accent transition-all duration-300 group-hover:gap-3`}
                    >
                      Learn more <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
