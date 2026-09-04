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
 * Homepage hero — luxury editorial composition:
 * - Mobile/Tablet: integrated layout with copy on the left (~65% width), photograph
 *   positioned slightly toward the right behind the content with a seamless soft mesh fade (zero hard vertical edges),
 *   and an elegant multi-wave SVG bottom contour line with 5-stop metallic gold gradient.
 * - Desktop: editorial split with left-aligned copy in the site container and a
 *   full-bleed right photograph panel extending to the viewport edge.
 */
export function Hero({ image }: Props) {
  return (
    <section className="relative w-full overflow-hidden bg-ivory">
      {/* Background photo panel:
          - Mobile / Tablet: spans full width behind content (inset-0), with the photograph positioned slightly right (62%)
            and a seamless full-width gradient mask/fade on the left from solid ivory (0-32%) to transparent (75-100%).
            This ensures zero sharp container edges or vertical lines!
          - Desktop (lg+): right-aligned 52% width panel that bleeds to the viewport edge.
      */}
      <div
        className="pointer-events-none absolute inset-0 z-0 lg:left-auto lg:right-0 lg:w-[52%]"
        aria-hidden
      >
        <div className="relative h-full w-full">
          {image ? (
            <MediaImage
              asset={image}
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              priority
              className="absolute inset-0"
              imgClassName="object-cover object-[30%_center] lg:object-center"
            />
          ) : (
            <Image
              src={DEFAULT_IMAGE_SRC}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover object-[30%_center] lg:object-center"
            />
          )}

          {/* Seamless full-width fade on mobile/tablet:
              Solid ivory across left 0–32%, soft transition 32–76%, clear image on right
          */}
          <div
            className="absolute inset-0 z-[1] lg:hidden"
            style={{
              background:
                "linear-gradient(to right, #faf8f3 0%, #faf8f3 32%, rgba(250, 248, 243, 0.96) 42%, rgba(250, 248, 243, 0.7) 58%, rgba(250, 248, 243, 0.25) 76%, transparent 92%)",
            }}
          />

          {/* Desktop left-edge blend */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-ivory via-ivory/70 to-transparent z-[1]" />

          {/* Top header soften fade */}
          <div className="absolute inset-x-0 top-0 h-32 sm:h-40 bg-gradient-to-b from-ivory via-ivory/80 to-transparent z-[1]" />

          {/* Bottom fade behind SVG curves */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ivory via-ivory/70 to-transparent z-[1] lg:h-24 lg:from-ivory/40" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[620px] sm:min-h-[680px] w-full max-w-[82rem] flex-col justify-start px-6 pt-40 pb-36 sm:px-8 sm:pt-42 sm:pb-40 lg:min-h-[98svh] lg:justify-center lg:py-0 lg:pl-0 lg:pr-12">
        <div className="max-w-[65%] sm:max-w-[60%] lg:max-w-lg">
          <Reveal>
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-accent-deep sm:text-[0.72rem] sm:tracking-[0.28em]">
              3 Star Decoration
            </p>
          </Reveal>

          <Reveal delay={0.1} y={20}>
            <h1 className="display mt-4 text-[clamp(1.85rem,6.8vw,2.35rem)] leading-[1.08] tracking-[-0.015em] text-charcoal sm:mt-6 sm:text-5xl sm:leading-[1.1] lg:text-[3.4rem] lg:leading-[1.02]">
              We transform every celebration into a setting{" "}
              <em className="text-accent-deep">worth remembering.</em>
            </h1>
          </Reveal>

          <Reveal delay={0.2} y={16}>
            <div className="mt-5 flex items-center gap-3 sm:mt-8">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0 text-accent"
                aria-hidden
              >
                <path
                  d="M12 2L14.2 9.5L21.5 12L14.2 14.5L12 22L9.8 14.5L2.5 12L9.8 9.5L12 2Z"
                  fill="currentColor"
                />
              </svg>
              <span className="h-px w-14 bg-line" />
            </div>
          </Reveal>

          <Reveal delay={0.26} y={16}>
            <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-stone sm:mt-5 sm:text-[0.8rem] sm:tracking-[0.24em]">
              Weddings · Receptions · Every Occasion
            </p>
          </Reveal>

          <Reveal delay={0.36} y={16}>
            <Link href="/portfolio" className="group mt-6 inline-flex items-center sm:mt-10">
              <span className="inline-flex h-11 items-center rounded-full bg-charcoal pl-5 pr-11 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory transition-colors duration-500 ease-[var(--ease-lux)] group-hover:bg-accent-deep sm:h-12 sm:pl-6 sm:pr-14 sm:text-[0.78rem]">
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

      {/* Multi-Wave Bottom SVG Overlay — Full width responsive (mobile, tablet, desktop) */}
      <svg
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 inset-x-0 z-[15] h-[130px] w-full sm:h-[160px] lg:h-[200px] xl:h-[240px]"
        aria-hidden
      >
        <defs>
          <linearGradient id="heroGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bf953f" />
            <stop offset="25%" stopColor="#fcf6ba" />
            <stop offset="50%" stopColor="#b38728" />
            <stop offset="75%" stopColor="#fbf5b7" />
            <stop offset="100%" stopColor="#aa771c" />
          </linearGradient>
        </defs>

        {/* Cream canvas fill following the multi-wave contour */}
        <path
          d="M 0 340 C 120 305, 240 305, 360 335 C 480 365, 600 365, 720 300 C 840 235, 960 280, 1080 205 C 1120 175, 1160 135, 1200 100 L 1200 400 L 0 400 Z"
          fill="#faf8f3"
        />

        {/* Single continuous multi-wave metallic gold contour stroke */}
        <path
          d="M 0 340 C 120 305, 240 305, 360 335 C 480 365, 600 365, 720 300 C 840 235, 960 280, 1080 205 C 1120 175, 1160 135, 1200 100"
          fill="none"
          stroke="url(#heroGoldGradient)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </section>
  );
}




