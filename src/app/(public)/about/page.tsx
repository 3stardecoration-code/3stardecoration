import type { Metadata } from "next";
import { getDataService } from "@/lib/services";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStory } from "@/components/about/AboutStory";
import { AboutStats } from "@/components/about/AboutStats";
import { AboutProcess } from "@/components/about/AboutProcess";
import { AboutTestimonials } from "@/components/about/AboutTestimonials";
import { AboutCta } from "@/components/about/AboutCta";

// Fully static — About content is editorial copy (no dynamic segments).
// On-demand revalidation via revalidatePath('/about') when settings change.
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const db = getDataService();
  const [seo, settings] = await Promise.all([
    db.settings.getSeoForRoute("about"),
    db.settings.get(),
  ]);
  const base = settings.canonical_base_url ?? undefined;
  const title = seo?.meta_title ?? "About Us | 3 Star Decoration";
  const description =
    seo?.meta_description ??
    "3 Star Decoration — a decade of crafting extraordinary celebrations in Chennai and across Tamil Nadu. Weddings, receptions, and every occasion in between.";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base ?? ""}/` },
      { "@type": "ListItem", position: 2, name: "About", item: `${base ?? ""}/about` },
    ],
  };

  return {
    title: { absolute: title },
    description,
    alternates: base ? { canonical: `${base}/about` } : undefined,
    robots: {
      index: seo?.robots_index ?? true,
      follow: seo?.robots_follow ?? true,
    },
    openGraph: {
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    other: {
      "application/ld+json": JSON.stringify(breadcrumb),
    },
  };
}

export default async function AboutPage() {
  const db = getDataService();
  const [settings, testimonials] = await Promise.all([
    db.settings.get(),
    db.testimonials.listPublished(),
  ]);

  const base = settings.canonical_base_url ?? "";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "About", item: `${base}/about` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <AboutHero />
      <AboutStory />
      <AboutStats />
      <AboutProcess />
      <AboutTestimonials testimonials={testimonials} />
      <AboutCta settings={settings} />
    </>
  );
}
