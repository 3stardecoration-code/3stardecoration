import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import type { AboutPageContent, MediaAsset } from "@/lib/domain";

// Used only when the admin hasn't set a story photo yet — a warm, gold-toned
// placeholder so the layout never looks broken before the client uploads one.
const FALLBACK_IMAGE = {
  id: "story-image-fallback",
  secure_url: "/demo-assets/wedding-04.jpg",
  alt_text: "3 Star Decoration — crafting an elegant wedding setup",
  width: 1600,
  height: 1067,
  dominant_color: "#a2988a",
};

type Props = Pick<
  AboutPageContent,
  "story_eyebrow" | "story_title" | "story_body" | "story_badge_value" | "story_badge_label" | "values"
> & { image: MediaAsset | null };

export function AboutStory({
  story_eyebrow,
  story_title,
  story_body,
  story_badge_value,
  story_badge_label,
  values,
  image,
}: Props) {
  const paragraphs = story_body.split(/\n\s*\n/).filter(Boolean);

  return (
    <section className="py-section">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Text column */}
          <div>
            <Reveal>
              <p className="eyebrow">{story_eyebrow}</p>
              <h2 className="display mt-4 text-4xl sm:text-5xl">{story_title}</h2>
            </Reveal>

            {paragraphs.map((paragraph, i) => (
              <Reveal key={i} delay={0.1 + i * 0.08} y={20}>
                <p className="mt-5 text-[0.98rem] leading-relaxed text-stone first:mt-8">{paragraph}</p>
              </Reveal>
            ))}

            {/* Values pills */}
            {values.length > 0 && (
              <Reveal delay={0.34} y={16}>
                <ul className="mt-10 flex flex-wrap gap-3" aria-label="Our values">
                  {values.map((val) => (
                    <li
                      key={val}
                      className="rounded-full border border-line px-4 py-2 text-[0.78rem] font-medium tracking-wide text-charcoal"
                    >
                      {val}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {/* Image column — tall portrait ratio */}
          <Reveal delay={0.08} y={32} className="relative">
            {/* Outer frame with slight offset border for editorial feel */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -right-4 -top-4 bottom-4 left-4 border border-accent/30"
              />
              <div className="relative aspect-[3/4] overflow-hidden">
                <MediaImage
                  asset={image ?? FALLBACK_IMAGE}
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  priority={false}
                />
              </div>
            </div>

            {/* Floating accent badge */}
            {story_badge_value && (
              <div
                className="absolute -bottom-6 -left-6 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-accent text-ivory shadow-xl sm:-bottom-8 sm:-left-8 sm:h-32 sm:w-32"
                aria-hidden
              >
                <span className="font-[family-name:var(--font-display)] text-3xl font-light leading-none">
                  {story_badge_value}
                </span>
                <span className="mt-1 text-center text-[0.58rem] font-medium uppercase tracking-[0.18em]">
                  {story_badge_label}
                </span>
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
