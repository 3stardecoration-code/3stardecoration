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
  const [big, small1, small2] = items;

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

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
          {big && (
            <Reveal className="md:col-span-7">
              <TiltProjectCard
                project={big.project}
                cover={big.cover}
                category={big.category}
                priority
                aspect="aspect-[4/5]"
                sizes="(min-width: 768px) 45vw, 90vw"
              />
            </Reveal>
          )}
          <div className="grid grid-cols-1 gap-6 md:col-span-5">
            {small1 && (
              <Reveal delay={0.1}>
                <TiltProjectCard
                  project={small1.project}
                  cover={small1.cover}
                  category={small1.category}
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 768px) 32vw, 90vw"
                />
              </Reveal>
            )}
            {small2 && (
              <Reveal delay={0.18}>
                <TiltProjectCard
                  project={small2.project}
                  cover={small2.cover}
                  category={small2.category}
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 768px) 32vw, 90vw"
                />
              </Reveal>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
