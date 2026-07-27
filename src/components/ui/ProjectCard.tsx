import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import type { Project, MediaAsset, Category } from "@/lib/domain";

type Props = {
  project: Project;
  cover?: MediaAsset;
  category?: Category;
  sizes: string;
  priority?: boolean;
  className?: string;
  aspect?: string;
};

export function ProjectCard({
  project,
  cover,
  category,
  sizes,
  priority,
  className = "",
  aspect = "aspect-[4/5]",
}: Props) {
  const year = project.event_date?.slice(0, 4);
  const label = category?.name ?? project.event_type ?? "Event";

  return (
    <Link href={`/portfolio/${project.slug}`} className={`group block ${className}`}>
      <div className={`relative ${aspect} overflow-hidden bg-line`}>
        {cover && (
          <MediaImage
            asset={cover}
            fill
            sizes={sizes}
            priority={priority}
            imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.06]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <div>
          <p className="eyebrow">{label}</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight">
            {project.title}
          </h3>
        </div>
        {year && <span className="shrink-0 text-sm text-stone">{year}</span>}
      </div>
    </Link>
  );
}
