import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataService } from "@/lib/services";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ProjectHero } from "@/components/portfolio/ProjectHero";
import { ProjectGallery } from "@/components/portfolio/ProjectGallery";
import { whatsappUrl } from "@/lib/whatsapp";
import type { MediaAsset, Project } from "@/lib/domain";

// ISR + on-demand revalidation (admin publish/edit will call revalidatePath).
export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getDataService().projects.listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "In progress",
  completed: "Completed",
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const db = getDataService();
  const res = await db.projects.getBySlug(slug);
  if (!res) return {};
  const { project } = res;
  const settings = await db.settings.get();
  const base = settings.canonical_base_url ?? undefined;
  const ogId = project.og_media_asset_id ?? project.cover_media_asset_id;
  const ogAsset = ogId ? await db.media.getById(ogId) : null;
  const ogUrl = ogAsset
    ? base && ogAsset.secure_url.startsWith("/")
      ? `${base}${ogAsset.secure_url}`
      : ogAsset.secure_url
    : undefined;
  const title = project.meta_title ?? `${project.title} | 3 Star Decoration`;
  const description = project.meta_description ?? project.summary ?? undefined;

  return {
    title: { absolute: title },
    description,
    alternates: base ? { canonical: `${base}/portfolio/${project.slug}` } : undefined,
    robots: { index: project.robots_index, follow: project.robots_follow },
    openGraph: {
      title,
      description,
      type: "article",
      images: ogUrl ? [{ url: ogUrl }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const db = getDataService();
  const res = await db.projects.getBySlug(slug);
  if (!res) notFound();
  const { project, media } = res;

  const [categories, settings, allResult] = await Promise.all([
    db.categories.list(),
    db.settings.get(),
    db.projects.listPublished({ page: 1, page_size: 999 }),
  ]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const all = allResult.items;

  // prev / next (circular) + related (same category first)
  const idx = all.findIndex((p) => p.id === project.id);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];
  const pool = all.filter((p) => p.id !== project.id);
  const related: Project[] = [
    ...pool.filter((p) => p.category_id === project.category_id),
    ...pool.filter((p) => p.category_id !== project.category_id),
  ].slice(0, 3);

  // resolve every media asset we render
  const ids = new Set<string>();
  if (project.cover_media_asset_id) ids.add(project.cover_media_asset_id);
  media.forEach((m) => ids.add(m.media_asset_id));
  [prev, next, ...related].forEach((p) => p?.cover_media_asset_id && ids.add(p.cover_media_asset_id));
  const assets = await db.media.getManyByIds([...ids]);

  const cover = project.cover_media_asset_id ? assets[project.cover_media_asset_id] : undefined;
  const galleryImages: MediaAsset[] = media
    .map((m) => assets[m.media_asset_id])
    .filter((m): m is MediaAsset => Boolean(m));
  const categoryName = catById.get(project.category_id)?.name ?? project.event_type ?? "Event";

  const heroMeta = [
    formatDate(project.event_date),
    project.location,
    STATUS_LABEL[project.project_status],
  ].filter((x): x is string => Boolean(x));

  const wa = whatsappUrl(
    settings.whatsapp_number,
    `Hi 3 Star Decoration, I loved "${project.title}" — I'd like something similar for my event.`,
  );

  const base = settings.canonical_base_url ?? "";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Portfolio", item: `${base}/portfolio` },
      { "@type": "ListItem", position: 3, name: project.title, item: `${base}/portfolio/${project.slug}` },
    ],
  };

  const infoRows = [
    { label: "Occasion", value: categoryName },
    { label: "Date", value: formatDate(project.event_date) },
    { label: "Location", value: project.location },
    { label: "Client", value: project.client_name },
    { label: "Status", value: STATUS_LABEL[project.project_status] },
  ].filter((r) => r.value);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <ProjectHero title={project.title} category={categoryName} meta={heroMeta} cover={cover} />

      {/* Intro: sticky info + narrative */}
      <section className="py-section">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-20">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Link
                href="/portfolio"
                className="mb-8 inline-flex items-center gap-2 text-sm text-stone transition-colors hover:text-charcoal"
              >
                <span aria-hidden>←</span> All work
              </Link>
              <dl className="space-y-5 border-t border-line pt-6">
                {infoRows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-stone">
                      {row.label}
                    </dt>
                    <dd className="mt-1.5 font-[family-name:var(--font-display)] text-lg">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>

            <Reveal className="max-w-2xl">
              {project.summary && (
                <p className="display text-3xl leading-tight sm:text-4xl">{project.summary}</p>
              )}
              {project.description && (
                // description is sanitized server-side on write (spec §12); the mock
                // fixtures are trusted, controlled HTML. TODO(supabase): confirm the
                // write-path sanitizer is in place before real CMS content flows here.
                <div
                  className="mt-8 space-y-5 text-[0.98rem] leading-relaxed text-stone [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              )}
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Cinematic gallery */}
      {galleryImages.length > 0 && (
        <section className="pb-section">
          <Container>
            <ProjectGallery images={galleryImages} />
          </Container>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="bg-espresso py-20 text-ivory sm:py-24">
        <Container className="text-center">
          <Reveal className="mx-auto max-w-2xl">
            <p className="eyebrow">Planning something similar?</p>
            <p className="display mt-5 text-3xl sm:text-5xl">
              Let&apos;s design yours, start to finish.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-accent-deep"
              >
                Get a quote <span aria-hidden>→</span>
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-ivory/35 px-7 py-3.5 text-sm font-medium text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
              >
                Chat on WhatsApp
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-section">
          <Container>
            <Reveal>
              <p className="eyebrow">Keep exploring</p>
              <h2 className="display mt-4 text-4xl sm:text-5xl">More celebrations</h2>
            </Reveal>
            <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <ProjectCard
                    project={p}
                    cover={p.cover_media_asset_id ? assets[p.cover_media_asset_id] : undefined}
                    category={catById.get(p.category_id)}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Prev / Next */}
      <nav className="border-t border-line" aria-label="Project navigation">
        <div className="mx-auto grid max-w-[82rem] grid-cols-1 sm:grid-cols-2">
          {prev && (
            <Link
              href={`/portfolio/${prev.slug}`}
              className="group flex flex-col gap-2 border-b border-line px-6 py-10 transition-colors hover:bg-porcelain sm:border-b-0 sm:border-r sm:px-12"
            >
              <span className="text-[0.62rem] uppercase tracking-[0.28em] text-stone">
                ← Previous
              </span>
              <span className="font-[family-name:var(--font-display)] text-2xl transition-transform duration-300 group-hover:-translate-x-1">
                {prev.title}
              </span>
            </Link>
          )}
          {next && (
            <Link
              href={`/portfolio/${next.slug}`}
              className="group flex flex-col items-end gap-2 px-6 py-10 text-right transition-colors hover:bg-porcelain sm:px-12"
            >
              <span className="text-[0.62rem] uppercase tracking-[0.28em] text-stone">Next →</span>
              <span className="font-[family-name:var(--font-display)] text-2xl transition-transform duration-300 group-hover:translate-x-1">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
