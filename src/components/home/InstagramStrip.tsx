import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import type { MediaAsset } from "@/lib/domain";

type Props = { images: MediaAsset[]; instagramUrl?: string };

export function InstagramStrip({ images, instagramUrl }: Props) {
  const shown = images.slice(0, 6);
  if (shown.length === 0) return null;

  return (
    <section className="py-section">
      <Container>
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="eyebrow">On the grid</p>
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

      <Reveal className="mt-14">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
          {shown.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden bg-line">
              <MediaImage
                asset={img}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-espresso/0 transition-colors duration-500 group-hover:bg-espresso/20" />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
