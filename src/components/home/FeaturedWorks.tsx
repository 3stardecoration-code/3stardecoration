import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { TiltProjectCard } from "@/components/home/TiltProjectCard";
import type { Project, MediaAsset, Category } from "@/lib/domain";

export type ResolvedProject = {
  project: Project;
  cover?: MediaAsset;
  category?: Category;
};

export function FeaturedWorks({ items }: { items: ResolvedProject[] }) {
  const shown = items.slice(0, 3);

  return (
    <section className="py-section">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected Work</p>
            <h2 className="display mt-4 text-5xl sm:text-6xl">Featured celebrations</h2>
          </div>
          <Link
            href="/portfolio"
            className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-charcoal"
          >
            View full portfolio
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </Link>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
          {shown.map((item, i) => (
            <Reveal key={item.project.id} delay={i * 0.08}>
              <TiltProjectCard
                project={item.project}
                cover={item.cover}
                category={item.category}
                priority={i === 0}
                aspect="aspect-[4/3] sm:aspect-[3/4]"
                sizes="(min-width: 1024px) 28vw, (min-width: 640px) 42vw, 90vw"
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
