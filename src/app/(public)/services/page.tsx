import type { Metadata } from "next";
import { getDataService } from "@/lib/services";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import type { MediaAsset } from "@/lib/domain";

// SSG — services listing is fully static; re-fetch triggered by admin publish
// via on-demand revalidation (revalidatePath('/services')).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const db = getDataService();
  const [seo, settings] = await Promise.all([
    db.settings.getSeoForRoute("services"),
    db.settings.get(),
  ]);
  const base = settings.canonical_base_url ?? undefined;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base ?? ""}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${base ?? ""}/services` },
    ],
  };

  return {
    title: seo?.meta_title ? { absolute: seo.meta_title } : "Our Services",
    description: seo?.meta_description ?? "Event decoration services by 3 Star Decoration — weddings, receptions, engagements, and birthdays.",
    alternates: base ? { canonical: `${base}/services` } : undefined,
    robots: {
      index: seo?.robots_index ?? true,
      follow: seo?.robots_follow ?? true,
    },
    openGraph: {
      title: seo?.meta_title ?? "Our Services | 3 Star Decoration",
      description: seo?.meta_description ?? "Event decoration services by 3 Star Decoration.",
    },
    other: {
      "application/ld+json": JSON.stringify(breadcrumb),
    },
  };
}

export default async function ServicesPage() {
  const db = getDataService();
  const [services, settings] = await Promise.all([
    db.services.listPublished(),
    db.settings.get(),
  ]);

  // Resolve cover images for any services that have media_asset_id set
  const coverIds = services
    .map((s) => s.media_asset_id)
    .filter((id): id is string => Boolean(id));
  const coverMedia: Record<string, MediaAsset> =
    coverIds.length > 0 ? await db.media.getManyByIds(coverIds) : {};

  const base = settings.canonical_base_url ?? "";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${base}/services` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ServicesHero />
      <ServicesGrid services={services} coverMedia={coverMedia} />
    </>
  );
}
