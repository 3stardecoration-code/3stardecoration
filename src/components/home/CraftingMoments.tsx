import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

type Feature = {
  lines: [string, string];
  src: string;
};

const FEATURES: Feature[] = [
  { lines: ["Elegant", "Designs"], src: "/icons/elegant-designs.png" },
  { lines: ["Personalized", "Experience"], src: "/icons/personalized-experience.png" },
  { lines: ["Quality", "& Passion"], src: "/icons/quality-passion.png" },
  { lines: ["Memorable", "Moments"], src: "/icons/memorable-moments.png" },
];

/** Small four-point sparkle used as an ornament between hairlines. */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2c0.6 4.2 2.2 5.8 6.4 6.4-4.2 0.6-5.8 2.2-6.4 6.4-0.6-4.2-2.2-5.8-6.4-6.4C9.8 7.8 11.4 6.2 12 2z" />
    </svg>
  );
}

/**
 * Value-proposition strip beneath the hero: an eyebrow + italic headline
 * ("Creating Memories"), a sparkle ornament, then four arched columns using
 * the client-supplied hand-drawn icon artwork (each already carries its own
 * blush watercolor backdrop).
 */
export function CraftingMoments() {
  return (
    <section className="relative overflow-hidden bg-ivory py-14 sm:py-24 lg:py-28">
      <Container className="relative">
        <Reveal className="text-center">
          <p className="eyebrow">Crafting Moments</p>
          <h2 className="display mt-3 text-3xl sm:mt-4 sm:text-5xl">
            Creating <em className="text-accent-deep">Memories</em>
          </h2>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3 sm:mt-6">
            <span className="h-px w-10 bg-line sm:w-16" />
            <Sparkle className="h-3.5 w-3.5 text-accent" />
            <span className="h-px w-10 bg-line sm:w-16" />
          </div>
        </Reveal>

        {/* 4 Feature Columns in a single row on mobile, tablet, and desktop */}
        <div className="mt-10 grid grid-cols-4 gap-1.5 sm:mt-16 sm:gap-4 lg:mt-20 lg:gap-8">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.lines.join(" ")} delay={i * 0.08} y={16} className="relative flex flex-col items-center">
              {i > 0 && (
                <span className="absolute left-0 top-12 hidden h-32 w-px bg-line lg:block" aria-hidden />
              )}
              <div className="relative h-20 w-16 overflow-hidden rounded-t-full border-x border-t border-accent bg-ivory sm:h-36 sm:w-32 lg:h-56 lg:w-48">
                <div className="absolute inset-1 sm:inset-2.5 lg:inset-3">
                  <Image
                    src={feature.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 11rem, (min-width: 640px) 8rem, 4.5rem"
                    className="mix-blend-multiply object-contain"
                  />
                </div>
              </div>
              <div className="mt-2 text-center sm:mt-5">
                <p className="display text-[0.72rem] leading-tight text-charcoal sm:text-lg lg:text-2xl">{feature.lines[0]}</p>
                <p className="mt-0.5 text-[0.45rem] font-medium uppercase tracking-[0.1em] text-accent-deep sm:mt-1.5 sm:text-[0.65rem] sm:tracking-[0.2em] lg:text-[0.72rem]">
                  {feature.lines[1]}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
