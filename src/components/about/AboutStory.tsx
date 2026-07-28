import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";

// A warm, gold-toned demo image that suits the brand story section.
// Swapped for a real brand photo when the client uploads via the Media Library.
const STORY_IMAGE = {
  id: "story-image",
  secure_url: "/demo-assets/wedding-04.jpg",
  alt_text: "3 Star Decoration — crafting an elegant wedding setup",
  width: 1600,
  height: 1067,
  dominant_color: "#a2988a",
};

export function AboutStory() {
  return (
    <section className="py-section">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Text column */}
          <div>
            <Reveal>
              <p className="eyebrow">Who we are</p>
              <h2 className="display mt-4 text-4xl sm:text-5xl">
                More than decoration — a design philosophy.
              </h2>
            </Reveal>

            <Reveal delay={0.1} y={20}>
              <p className="mt-8 text-[0.98rem] leading-relaxed text-stone">
                Founded in Chennai, 3 Star Decoration began with a single wedding and a conviction:
                that every celebration, regardless of scale, deserves a considered aesthetic. We
                don&apos;t apply templates. We listen, sketch, source, and build — from scratch,
                every time.
              </p>
            </Reveal>

            <Reveal delay={0.18} y={20}>
              <p className="mt-5 text-[0.98rem] leading-relaxed text-stone">
                Over the years, our work has spanned intimate home engagements to grand ballroom
                receptions, baby showers to corporate galas. The through-line is always the same:
                a quiet, luxury aesthetic that makes the event feel <em>inevitable</em> — as if it
                could only have looked this way.
              </p>
            </Reveal>

            <Reveal delay={0.26} y={20}>
              <p className="mt-5 text-[0.98rem] leading-relaxed text-stone">
                We work with florals, fabrics, lighting, and furniture — shaping the atmosphere
                around your story, not ours. When the day arrives, you step in and everything
                simply <em>is</em>.
              </p>
            </Reveal>

            {/* Values pills */}
            <Reveal delay={0.34} y={16}>
              <ul className="mt-10 flex flex-wrap gap-3" aria-label="Our values">
                {[
                  "Bespoke design",
                  "On-time delivery",
                  "Zero-template approach",
                  "Full-service setup",
                  "Post-event cleanup",
                ].map((val) => (
                  <li
                    key={val}
                    className="rounded-full border border-line px-4 py-2 text-[0.78rem] font-medium tracking-wide text-charcoal"
                  >
                    {val}
                  </li>
                ))}
              </ul>
            </Reveal>
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
                  asset={STORY_IMAGE}
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  priority={false}
                />
              </div>
            </div>

            {/* Floating accent badge */}
            <div
              className="absolute -bottom-6 -left-6 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-accent text-ivory shadow-xl sm:-bottom-8 sm:-left-8 sm:h-32 sm:w-32"
              aria-hidden
            >
              <span className="font-[family-name:var(--font-display)] text-3xl font-light leading-none">
                10+
              </span>
              <span className="mt-1 text-center text-[0.58rem] font-medium uppercase tracking-[0.18em]">
                Years of craft
              </span>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
