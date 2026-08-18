import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";

// Phone and tablet are both narrower than they are tall, so the pillar is
// sized by width there (capped well clear of the centred text); only from
// lg: up is there enough horizontal room to size by height instead and let
// it grow to fill the viewport.
const PILLAR_SIZE = "h-auto w-[26vw] max-w-[150px] sm:w-[22vw] sm:max-w-[210px] lg:h-full lg:w-auto lg:max-w-none";
// Keeps the pillar's top edge clear of the fixed header (which is
// transparent until scrolled) at every breakpoint. flex+justify-end pins
// the image to the BOTTOM of this box — needed on mobile, where the image
// is sized by width (h-auto) rather than h-full, so it wouldn't otherwise
// stretch down to the bottom on its own.
// Hidden on mobile per request — the pillars only show from sm: (tablet) up.
const PILLAR_BOX = "absolute bottom-0 top-24 hidden flex-col justify-end sm:flex sm:top-28 lg:top-32";

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
          <Link href="/portfolio" className="group mt-10 inline-flex items-center gap-4">
            <span className="relative overflow-hidden text-[0.8rem] font-medium uppercase tracking-[0.16em] text-charcoal">
              View Portfolio
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-100 bg-charcoal/30 transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-x-0" />
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-x-100" />
            </span>
            <Magnetic strength={0.4}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/25 text-charcoal transition-all duration-500 ease-[var(--ease-lux)] group-hover:border-accent group-hover:bg-accent group-hover:text-ivory">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform duration-500 ease-[var(--ease-lux)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  <path
                    d="M4 12L12 4M12 4H5.5M12 4V10.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Magnetic>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
