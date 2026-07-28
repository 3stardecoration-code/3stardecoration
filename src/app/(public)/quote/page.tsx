import type { Metadata } from "next";
import { getDataService } from "@/lib/services";
import { QuoteHero } from "@/components/quote/QuoteHero";
import { QuoteForm } from "@/components/quote/QuoteForm";

// Fully static — quote page structure doesn't change. The form is a client
// component that calls a Server Action at runtime. Settings (phone/WhatsApp)
// are embedded into the page at build time; revalidatePath('/quote') is called
// by the settings Server Action in Phase 5 when numbers change.
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const db = getDataService();
  const [seo, settings] = await Promise.all([
    db.settings.getSeoForRoute("quote"),
    db.settings.get(),
  ]);
  const base = settings.canonical_base_url ?? undefined;
  const title = seo?.meta_title ?? "Get a Free Quote | 3 Star Decoration";
  const description =
    seo?.meta_description ??
    "Request a free event decoration quote from 3 Star Decoration. Fill in the form and we'll connect on WhatsApp to plan your celebration.";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base ?? ""}/` },
      { "@type": "ListItem", position: 2, name: "Get a Quote", item: `${base ?? ""}/quote` },
    ],
  };

  return {
    title: { absolute: title },
    description,
    alternates: base ? { canonical: `${base}/quote` } : undefined,
    robots: {
      // Don't index the form page — avoids duplicate content and bot spam
      index: seo?.robots_index ?? false,
      follow: seo?.robots_follow ?? true,
    },
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
    other: { "application/ld+json": JSON.stringify(breadcrumb) },
  };
}

export default async function QuotePage() {
  const db = getDataService();
  const settings = await db.settings.get();
  const base = settings.canonical_base_url ?? "";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Get a Quote", item: `${base}/quote` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <QuoteHero />
      <QuoteForm settings={settings} />
    </>
  );
}
