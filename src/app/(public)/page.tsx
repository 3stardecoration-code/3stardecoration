import type { Metadata } from "next";
import { getDataService } from "@/lib/services";
import { Hero } from "@/components/home/Hero";
import { SignatureStatement } from "@/components/home/SignatureStatement";
import { FeaturedWorks, type ResolvedProject } from "@/components/home/FeaturedWorks";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { TransformationShowcase } from "@/components/home/TransformationShowcase";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramStrip } from "@/components/home/InstagramStrip";
import { QuoteCta } from "@/components/home/QuoteCta";
import type { MediaAsset } from "@/lib/domain";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getDataService().settings.getSeoForRoute("home");
  return {
    // absolute so the layout's "%s | 3 Star Decoration" template isn't doubled
    title: seo?.meta_title ? { absolute: seo.meta_title } : undefined,
    description: seo?.meta_description ?? undefined,
  };
}

export default async function HomePage() {
  const db = getDataService();
  const [heroes, featured, services, testimonials, settings, sections, categories] = await Promise.all([
    db.hero.listPublished(),
    db.projects.listFeatured(),
    db.services.listPublished(),
    db.testimonials.listPublished(),
    db.settings.get(),
    db.homepage.listEnabledSections(),
    db.categories.list(),
  ]);

  const catById = new Map(categories.map((c) => [c.id, c]));
  const sectionByKey = new Map(sections.map((s) => [s.section_key, s]));
  const beforeAfterConfig = sectionByKey.get("before_after")?.config ?? {};
  const testimonialsConfig = sectionByKey.get("testimonials")?.config ?? {};
  const instagramConfig = sectionByKey.get("instagram")?.config ?? {};
  const beforeId = beforeAfterConfig.before_media_asset_id as string | undefined;
  const afterId = beforeAfterConfig.after_media_asset_id as string | undefined;
  const testimonialsBgId = testimonialsConfig.background_media_asset_id as string | undefined;
  const instagramIds = (instagramConfig.media_asset_ids as string[] | undefined) ?? [];

  const ids = new Set<string>();
  featured.forEach((p) => p.cover_media_asset_id && ids.add(p.cover_media_asset_id));
  services.forEach((s) => s.media_asset_id && ids.add(s.media_asset_id));
  instagramIds.forEach((id) => ids.add(id));
  if (beforeId) ids.add(beforeId);
  if (afterId) ids.add(afterId);
  if (testimonialsBgId) ids.add(testimonialsBgId);
  const media = await db.media.getManyByIds([...ids]);

  const heroBanner = heroes[0];

  const featuredResolved: ResolvedProject[] = featured.slice(0, 3).map((project) => ({
    project,
    cover: project.cover_media_asset_id ? media[project.cover_media_asset_id] : undefined,
    category: catById.get(project.category_id),
  }));

  const instaImages: MediaAsset[] = instagramIds
    .map((id) => media[id])
    .filter((m): m is MediaAsset => Boolean(m));

  const beforeAsset = beforeId ? media[beforeId] : undefined;
  const afterAsset = afterId ? media[afterId] : undefined;
  const testimonialsBg = testimonialsBgId ? media[testimonialsBgId] : undefined;

  const enabled = new Set(sections.map((s) => s.section_key));
  const igUrl = settings.social_links?.instagram || undefined;

  return (
    <>
      {heroBanner && enabled.has("hero") && <Hero banner={heroBanner} />}
      <SignatureStatement />
      {enabled.has("featured_works") && <FeaturedWorks items={featuredResolved} />}
      {enabled.has("featured_services") && <ServicesPreview services={services} media={media} />}
      {enabled.has("before_after") && beforeAsset && afterAsset && (
        <TransformationShowcase before={beforeAsset} after={afterAsset} />
      )}
      {enabled.has("testimonials") && <Testimonials items={testimonials} background={testimonialsBg} />}
      {enabled.has("instagram") && <InstagramStrip images={instaImages} instagramUrl={igUrl} />}
      {enabled.has("quote_cta") && <QuoteCta settings={settings} />}
    </>
  );
}
