import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import type { MediaAsset } from "@/lib/domain";

type Props = { images: MediaAsset[]; instagramUrl?: string };

// Varied ratios give the wall a Pinterest-style rhythm from a uniform source.
const RATIOS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[4/5]"];

export function InstagramStrip({ images, instagramUrl }: Props) {
  const shown = images.slice(0, 8);
  if (shown.length === 0) return null;

  return (
    <section className="py-section">
      <Container>
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="eyebrow">On the Grid</p>
          <h2 className="display text-4xl sm:text-5xl">Follow the everyday beauty</h2>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-sm font-medium tracking-wide text-accent-deep hover:opacity-80"
            >
              @3stardecoration →
            </a>
          )}
        </Reveal>
      </Container>

      <Container className="mt-14">
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {shown.map((img, i) => (
            <Reveal key={img.id} delay={(i % 4) * 0.06} className="mb-3 block break-inside-avoid">
              <div className={`group relative overflow-hidden bg-line ${RATIOS[i % RATIOS.length]}`}>
                <MediaImage
                  asset={img}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/30" />
                <div className="pointer-events-none absolute inset-2 rounded-sm border border-accent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-400 ease-[var(--ease-lux)] group-hover:opacity-100">
                  <span className="flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-ivory/90 text-charcoal transition-transform duration-400 ease-[var(--ease-lux)] group-hover:scale-100">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
