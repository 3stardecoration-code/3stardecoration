import type { Metadata } from "next";
import { getDataService } from "@/lib/services";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactInfo } from "@/components/contact/ContactInfo";

// Fully static — Contact content comes from SiteSettings which changes rarely.
// Phase 5 settings Server Action will call revalidatePath('/contact') on update.
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const db = getDataService();
  const [seo, settings] = await Promise.all([
    db.settings.getSeoForRoute("contact"),
    db.settings.get(),
  ]);
  const base = settings.canonical_base_url ?? undefined;
  const title = seo?.meta_title ?? "Contact Us | 3 Star Decoration";
  const description =
    seo?.meta_description ??
    "Get in touch with 3 Star Decoration — call, email, or chat on WhatsApp to plan your event.";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base ?? ""}/` },
      { "@type": "ListItem", position: 2, name: "Contact", item: `${base ?? ""}/contact` },
    ],
  };

  return {
    title: { absolute: title },
    description,
    alternates: base ? { canonical: `${base}/contact` } : undefined,
    robots: { index: seo?.robots_index ?? true, follow: seo?.robots_follow ?? true },
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
    other: { "application/ld+json": JSON.stringify(breadcrumb) },
  };
}

export default async function ContactPage() {
  const db = getDataService();
  const settings = await db.settings.get();
  const base = settings.canonical_base_url ?? "";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Contact", item: `${base}/contact` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ContactHero />
      <ContactInfo settings={settings} />
    </>
  );
}
