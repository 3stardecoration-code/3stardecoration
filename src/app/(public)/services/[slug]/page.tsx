import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDataService } from "@/lib/services";
import { ServiceDetail } from "@/components/services/ServiceDetail";

// ISR + on-demand revalidation (admin publish/edit calls revalidatePath).
export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const services = await getDataService().services.listPublished();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const db = getDataService();
  const service = await db.services.getBySlug(slug);
  if (!service) return {};

  const settings = await db.settings.get();
  const base = settings.canonical_base_url ?? undefined;
  const title = service.meta_title ?? `${service.title} | 3 Star Decoration`;
  const description = service.meta_description ?? service.short_description ?? undefined;

  // Resolve OG image
  const ogId = service.og_media_asset_id ?? service.media_asset_id;
  const ogAsset = ogId ? await db.media.getById(ogId) : null;
  const ogUrl = ogAsset
    ? base && ogAsset.secure_url.startsWith("/")
      ? `${base}${ogAsset.secure_url}`
      : ogAsset.secure_url
    : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: base ? { canonical: `${base}/services/${service.slug}` } : undefined,
    robots: { index: service.robots_index, follow: service.robots_follow },
    openGraph: {
      title,
      description,
      images: ogUrl ? [{ url: ogUrl }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const db = getDataService();
  const [service, settings] = await Promise.all([
    db.services.getBySlug(slug),
    db.settings.get(),
  ]);
  if (!service) notFound();

  // Resolve cover image
  const coverId = service.media_asset_id;
  const coverAsset = coverId ? (await db.media.getById(coverId)) ?? undefined : undefined;

  const base = settings.canonical_base_url ?? "";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${base}/services` },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: `${base}/services/${service.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ServiceDetail service={service} coverAsset={coverAsset} settings={settings} />
    </>
  );
}
