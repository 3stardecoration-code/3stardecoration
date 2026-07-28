import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import type { Project, MediaAsset, Category } from "@/lib/domain";

// Varied aspect ratios give the masonry an editorial, non-uniform rhythm even
// though the source photos share one ratio.
const RATIOS = [
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[3/2]",
  "aspect-[4/5]",
  "aspect-[1/1]",
  "aspect-[3/4]",
];

type Props = {
  project: Project;
  cover?: MediaAsset;
  category?: Category;
  index: number;
  sizes: string;
  priority?: boolean;
};

export function PortfolioCard({ project, cover, category, index, sizes, priority }: Props) {
  const ratio = RATIOS[index % RATIOS.length];
  const label = category?.name ?? project.event_type ?? "Event";

  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group relative block overflow-hidden"
      aria-label={`${project.title} — ${label}`}
    >
      <div className={`relative ${ratio} overflow-hidden bg-line`}>
        {cover && (
          <MediaImage
            asset={cover}
            fill
            sizes={sizes}
            priority={priority}
            imgClassName="transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.07]"
          />
        )}
        {/* Persistent, understated caption scrim — deepens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/5 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6">
          <div className="translate-y-0 transition-transform duration-500 ease-[var(--ease-lux)] group-hover:-translate-y-1">
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-accent">
              {label}
            </p>
            <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-xl leading-tight text-ivory">
              {project.title}
            </h3>
          </div>
          <span
            className="mb-1 shrink-0 text-ivory opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:opacity-100"
            aria-hidden
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
