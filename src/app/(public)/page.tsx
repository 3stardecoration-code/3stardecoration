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
import { BEFORE_AFTER_IDS, TESTIMONIALS_BG_ID } from "@/lib/services/mock/fixtures";
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
  const [heroes, featured, services, testimonials, homeGallery, settings, sections, categories] =
    await Promise.all([
      db.hero.listPublished(),
      db.projects.listFeatured(),
      db.services.listPublished(),
      db.testimonials.listPublished(),
      db.galleries.getBySlug("homepage-featured"),
      db.settings.get(),
      db.homepage.listEnabledSections(),
      db.categories.list(),
    ]);

  const catById = new Map(categories.map((c) => [c.id, c]));

  const ids = new Set<string>();
  heroes.forEach((h) => h.media_asset_id && ids.add(h.media_asset_id));
  featured.forEach((p) => p.cover_media_asset_id && ids.add(p.cover_media_asset_id));
  services.forEach((s) => s.media_asset_id && ids.add(s.media_asset_id));
  homeGallery?.items.forEach((it) => ids.add(it.media_asset_id));
  ids.add(BEFORE_AFTER_IDS.before);
  ids.add(BEFORE_AFTER_IDS.after);
  ids.add(TESTIMONIALS_BG_ID);
  const media = await db.media.getManyByIds([...ids]);

  const heroBanner = heroes[0];
  const heroAsset = heroBanner?.media_asset_id ? media[heroBanner.media_asset_id] : undefined;

  const featuredResolved: ResolvedProject[] = featured.slice(0, 3).map((project) => ({
    project,
    cover: project.cover_media_asset_id ? media[project.cover_media_asset_id] : undefined,
    category: catById.get(project.category_id),
  }));

  const instaImages: MediaAsset[] = (homeGallery?.items ?? [])
    .map((it) => media[it.media_asset_id])
    .filter((m): m is MediaAsset => Boolean(m));

  const beforeAsset = media[BEFORE_AFTER_IDS.before];
  const afterAsset = media[BEFORE_AFTER_IDS.after];
  const testimonialsBg = media[TESTIMONIALS_BG_ID];

  const enabled = new Set(sections.map((s) => s.section_key));
  const igUrl = settings.social_links?.instagram || undefined;

  return (
    <>
      {heroBanner && enabled.has("hero") && <Hero banner={heroBanner} asset={heroAsset} />}
      <SignatureStatement />
      {enabled.has("featured_works") && <FeaturedWorks items={featuredResolved} />}
      {enabled.has("featured_services") && <ServicesPreview services={services} media={media} />}
      {beforeAsset && afterAsset && (
        <TransformationShowcase before={beforeAsset} after={afterAsset} />
      )}
      {enabled.has("testimonials") && <Testimonials items={testimonials} background={testimonialsBg} />}
      {enabled.has("instagram") && <InstagramStrip images={instaImages} instagramUrl={igUrl} />}
      {enabled.has("quote_cta") && <QuoteCta settings={settings} />}
    </>
  );
}
