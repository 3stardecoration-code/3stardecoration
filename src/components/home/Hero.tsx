import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import type { MediaAsset } from "@/lib/domain";

const DEFAULT_IMAGE_SRC = "/demo-assets/stage-01.jpg";

type HeroImage = Pick<MediaAsset, "secure_url" | "alt_text" | "width" | "height" | "dominant_color">;

type Props = {
  /** Admin-selected photo from Homepage → Hero; falls back to the built-in placeholder when unset. */
  image?: HeroImage;
};

/**
 * Homepage hero — editorial split: left-aligned copy in the standard site
 * container (aligned with the header's logo/nav), a full-bleed photograph
 * on the right that runs to the true edge of the viewport.
 */
export function Hero({ image }: Props) {
  return (
    <section className="relative w-full overflow-hidden bg-ivory">
      {/* Right-side photo panel — bleeds to the viewport edge, desktop only */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] lg:block" aria-hidden>
        <div className="relative h-full w-full">
          {image ? (
            <MediaImage asset={image} fill sizes="52vw" priority className="absolute inset-0" />
          ) : (
            <Image
              src={DEFAULT_IMAGE_SRC}
              alt=""
              fill
              priority
              sizes="52vw"
              className="object-cover object-center"
            />
          )}
          {/* Blend the left edge into the page background */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-ivory via-ivory/70 to-transparent" />
          {/* Soften the top edge under the header */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ivory/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ivory/40 to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[70svh] w-full max-w-[82rem] flex-col justify-center px-6 py-28 sm:px-8 sm:py-32 lg:min-h-[98svh] lg:py-0 lg:pl-0 lg:pr-12">
        <div className="max-w-sm sm:max-w-md lg:max-w-lg">
          <Reveal>
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-accent-deep sm:text-[0.72rem] sm:tracking-[0.28em]">
              3 Star Decoration
            </p>
          </Reveal>

          <Reveal delay={0.1} y={20}>
            <h1 className="display mt-5 text-[10vw] leading-[1.12] text-charcoal sm:mt-6 sm:text-5xl sm:leading-[1.1] lg:text-[3.4rem]">
              We transform every celebration into a setting{" "}
              <em className="text-accent-deep">worth remembering.</em>
            </h1>
          </Reveal>

          <Reveal delay={0.2} y={16}>
            <div className="mt-6 flex items-center gap-3 sm:mt-8">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent" aria-hidden>
                <path
                  d="M12 2L14.2 9.5L21.5 12L14.2 14.5L12 22L9.8 14.5L2.5 12L9.8 9.5L12 2Z"
                  fill="currentColor"
                />
              </svg>
              <span className="h-px w-14 bg-line" />
            </div>
          </Reveal>

          <Reveal delay={0.26} y={16}>
            <p className="mt-4 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-stone sm:mt-5 sm:text-[0.8rem] sm:tracking-[0.24em]">
              Weddings · Receptions · Every Occasion
            </p>
          </Reveal>

          <Reveal delay={0.36} y={16}>
            <Link href="/portfolio" className="group mt-8 inline-flex items-center sm:mt-11">
              <span className="inline-flex h-11 items-center rounded-full bg-charcoal pl-6 pr-12 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ivory transition-colors duration-500 ease-[var(--ease-lux)] group-hover:bg-accent-deep sm:h-12 sm:pr-14 sm:text-[0.78rem]">
                View Portfolio
              </span>
              <span className="-ml-9 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-charcoal/10 bg-ivory text-charcoal shadow-[0_2px_10px_rgba(21,21,21,0.15)] sm:-ml-10 sm:h-10 sm:w-10">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="sm:h-4 sm:w-4"
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
            </Link>
          </Reveal>
        </div>
      </div>

      {/* Photo strip for mobile / tablet, where the absolute bleed panel is hidden */}
      <div className="relative h-[46vh] w-full sm:h-[54vh] lg:hidden">
        {image ? (
          <MediaImage asset={image} fill sizes="100vw" className="absolute inset-0" />
        ) : (
          <Image
            src={DEFAULT_IMAGE_SRC}
            alt="An event space styled by 3 Star Decoration"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ivory to-transparent" />
      </div>
    </section>
  );
}
