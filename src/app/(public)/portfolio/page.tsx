import type { Metadata } from "next";
import Link from "next/link";
import { getDataService } from "@/lib/services";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CategoryFilter } from "@/components/portfolio/CategoryFilter";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";

const PAGE_SIZE = 9;

// ISR: revalidate periodically; publish/edit also triggers on-demand revalidation.
export const revalidate = 3600;

type SearchParams = Promise<{ category?: string; page?: string }>;

export async function generateMetadata(): Promise<Metadata> {
  const db = getDataService();
  const [seo, settings] = await Promise.all([db.settings.getSeoForRoute("portfolio"), db.settings.get()]);
  const base = settings.canonical_base_url ?? undefined;
  return {
    title: seo?.meta_title ? { absolute: seo.meta_title } : "Our Work",
    description: seo?.meta_description ?? "Explore our event decoration portfolio.",
    alternates: base ? { canonical: `${base}/portfolio` } : undefined,
    robots: {
      index: seo?.robots_index ?? true,
      follow: seo?.robots_follow ?? true,
    },
    openGraph: {
      title: seo?.meta_title ?? "Our Work | 3 Star Decoration",
      description: seo?.meta_description ?? "Explore our event decoration portfolio.",
    },
  };
}

export default async function PortfolioPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const activeCategory = typeof sp.category === "string" ? sp.category : undefined;
  const pageNum = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const db = getDataService();
  const categories = await db.categories.list();
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));
  const catById = new Map(categories.map((c) => [c.id, c]));

  const result = await db.projects.listPublished({
    category_slug: activeCategory,
    page: 1,
    page_size: pageNum * PAGE_SIZE,
  });
  const media = await db.media.getManyByIds(
    result.items.map((p) => p.cover_media_asset_id).filter((x): x is string => Boolean(x)),
  );

  const items = result.items;
  const hasMore = result.has_more;
  const nextHref = `/portfolio?${activeCategory ? `category=${activeCategory}&` : ""}page=${pageNum + 1}`;
  const activeName = activeCategory ? catBySlug.get(activeCategory)?.name : null;

  return (
    <div className="pt-32 pb-section sm:pt-36">
      <Container>
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Portfolio</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl lg:text-7xl">
            {activeName ? activeName : "Our work"}
          </h1>
          <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-stone">
            A gallery of celebrations we&apos;ve designed and built — each one styled from a blank
            canvas. Filter by occasion, or browse it all.
          </p>
        </Reveal>

        <div className="mt-12">
          <CategoryFilter categories={categories} active={activeCategory} />
        </div>

        {items.length === 0 ? (
          <div className="mt-24 flex flex-col items-center gap-5 py-16 text-center">
            <span className="text-3xl text-accent" aria-hidden>
              ✦
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl">
              Nothing here just yet
            </h2>
            <p className="max-w-sm text-sm text-stone">
              We haven&apos;t added projects to this category yet. Explore the full portfolio, or
              tell us about your event.
            </p>
            <div className="mt-2 flex gap-3">
              <Link
                href="/portfolio"
                className="rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-espresso"
              >
                View all work
              </Link>
              <Link
                href="/quote"
                className="rounded-full border border-line px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:border-charcoal"
              >
                Get a quote
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-14 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
              {items.map((project, i) => (
                <Reveal
                  key={project.id}
                  delay={(i % 3) * 0.06}
                  y={36}
                  className="mb-6 block break-inside-avoid"
                >
                  <PortfolioCard
                    project={project}
                    cover={project.cover_media_asset_id ? media[project.cover_media_asset_id] : undefined}
                    category={catById.get(project.category_id)}
                    index={i}
                    priority={i < 3}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  />
                </Reveal>
              ))}
            </div>

            {hasMore && (
              <div className="mt-16 flex flex-col items-center gap-4">
                <Link
                  href={nextHref}
                  scroll={false}
                  className="inline-flex items-center gap-2 rounded-full border border-charcoal px-8 py-4 text-sm font-medium tracking-wide text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-ivory"
                >
                  Load more work
                  <span aria-hidden>↓</span>
                </Link>
                <p className="text-xs uppercase tracking-[0.25em] text-stone">
                  Showing {items.length} of {result.total}
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
