import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

// Mobile is narrow but tall, so the pillar is sized by width there (capped
// well clear of the centred text); from sm: up there's enough horizontal
// room to size by height instead, so it can grow to fill the viewport.
const PILLAR_SIZE = "h-auto w-[26vw] max-w-[150px] sm:h-full sm:w-auto sm:max-w-none";
// Keeps the pillar's top edge clear of the fixed header (which is
// transparent until scrolled) at every breakpoint.
const PILLAR_BOX = "absolute bottom-0 top-24 sm:top-28 lg:top-32";

/**
 * Homepage hero — a minimal wedding-mandap composition: the real pillar
 * photo framing both edges (mirrored on the left), clean centred copy in
 * the negative space between them. Deliberately no other photography here
 * (see FeaturedWorks/Portfolio for that) — this is meant to read like a
 * wedding invitation, not a photo banner.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[88svh] w-full items-center justify-center overflow-hidden bg-ivory py-28 sm:py-32 lg:min-h-[92svh] lg:py-0">
      {/* Pillars — anchored to the bottom corners, visible (narrower) at every breakpoint */}
      <div className={`pointer-events-none ${PILLAR_BOX} left-0 z-0`} aria-hidden>
        <Image
          src="/brand/hero-pillar.png"
          alt=""
          width={920}
          height={1635}
          priority
          className={`${PILLAR_SIZE} scale-x-[-1] object-contain object-bottom`}
        />
      </div>
      <div className={`pointer-events-none ${PILLAR_BOX} right-0 z-0`} aria-hidden>
        <Image
          src="/brand/hero-pillar.png"
          alt=""
          width={920}
          height={1635}
          priority
          className={`${PILLAR_SIZE} object-contain object-bottom`}
        />
      </div>

      {/* Centre content */}
      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-6 text-center sm:px-8">
        <Reveal>
          <p className="eyebrow text-accent-deep">3 Star Decoration</p>
        </Reveal>

        <Reveal delay={0.1} y={20}>
          <h1 className="display mt-6 text-[8.5vw] leading-[1.15] text-charcoal sm:text-4xl lg:text-5xl">
            We transform every celebration into a setting{" "}
            <em className="text-accent-deep">worth remembering.</em>
          </h1>
        </Reveal>

        <Reveal delay={0.22} y={16}>
          <p className="mt-7 text-[0.8rem] font-medium uppercase tracking-[0.24em] text-stone">
            Weddings · Receptions · Every Occasion
          </p>
        </Reveal>

        <Reveal delay={0.32} y={16}>
          <Link
            href="/portfolio"
            className="group mt-10 inline-flex items-center gap-2.5 rounded-lg bg-accent px-7 py-3.5 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ivory shadow-[0_10px_28px_rgba(201,164,106,0.35)] transition-colors duration-300 hover:bg-accent-deep"
          >
            View Portfolio
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
