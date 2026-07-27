import type {
  Category,
  MediaAsset,
  Project,
  ProjectMedia,
  Gallery,
  GalleryItem,
  Service,
  Testimonial,
  HeroBanner,
  HomepageSection,
  SiteSettings,
  SeoMeta,
  LegalPage,
} from "@/lib/domain";

function img(id: string, url: string, alt: string): MediaAsset {
  return {
    id,
    source: "cloudinary_image",
    public_id: null,
    provider_id: null,
    secure_url: url,
    thumbnail_url: url,
    width: 1600,
    height: 1067,
    duration: null,
    format: "jpg",
    file_size: null,
    alt_text: alt,
    title: alt,
    caption: null,
    tags: [],
    dominant_color: "#d8cfc4",
    blur_placeholder: null,
    favorite: false,
    uploaded_by: null,
    uploaded_at: "2026-01-01T00:00:00.000Z",
    usage_count: 1,
    deleted_at: null,
  };
}

export const categories: Category[] = [
  { id: "cat-wedding", name: "Wedding", slug: "wedding", description: null, sort_order: 1, cover_media_asset_id: null },
  { id: "cat-reception", name: "Reception", slug: "reception", description: null, sort_order: 2, cover_media_asset_id: null },
  { id: "cat-engagement", name: "Engagement", slug: "engagement", description: null, sort_order: 3, cover_media_asset_id: null },
  { id: "cat-birthday", name: "Birthday", slug: "birthday", description: null, sort_order: 4, cover_media_asset_id: null },
  { id: "cat-baby-shower", name: "Baby Shower", slug: "baby-shower", description: null, sort_order: 5, cover_media_asset_id: null },
  { id: "cat-corporate", name: "Corporate", slug: "corporate", description: null, sort_order: 6, cover_media_asset_id: null },
  { id: "cat-stage", name: "Stage", slug: "stage", description: null, sort_order: 7, cover_media_asset_id: null },
];

// 14 published projects across the 7 categories (2 each). Cover + 4 gallery images each.
const projectSeed: Array<{ slug: string; title: string; cat: string; featured?: boolean }> = [
  { slug: "ivory-garden-wedding", title: "Ivory Garden Wedding", cat: "cat-wedding", featured: true },
  { slug: "rosewood-vows", title: "Rosewood Vows", cat: "cat-wedding" },
  { slug: "golden-hour-reception", title: "Golden Hour Reception", cat: "cat-reception", featured: true },
  { slug: "crystal-ballroom-reception", title: "Crystal Ballroom Reception", cat: "cat-reception" },
  { slug: "moonlit-engagement", title: "Moonlit Engagement", cat: "cat-engagement" },
  { slug: "blush-proposal", title: "Blush Proposal", cat: "cat-engagement" },
  { slug: "confetti-first-birthday", title: "Confetti First Birthday", cat: "cat-birthday", featured: true },
  { slug: "neon-sweet-sixteen", title: "Neon Sweet Sixteen", cat: "cat-birthday" },
  { slug: "cloud-nine-baby-shower", title: "Cloud Nine Baby Shower", cat: "cat-baby-shower" },
  { slug: "little-star-shower", title: "Little Star Shower", cat: "cat-baby-shower" },
  { slug: "summit-corporate-gala", title: "Summit Corporate Gala", cat: "cat-corporate" },
  { slug: "launch-night-corporate", title: "Launch Night Corporate", cat: "cat-corporate" },
  { slug: "grand-stage-sangeet", title: "Grand Stage Sangeet", cat: "cat-stage" },
  { slug: "aurora-stage-design", title: "Aurora Stage Design", cat: "cat-stage" },
];

export const mediaAssets: MediaAsset[] = [];
export const projects: Project[] = [];
export const projectMedia: ProjectMedia[] = [];

projectSeed.forEach((p, i) => {
  const n = String(i + 1).padStart(2, "0");
  const coverId = `media-${p.slug}-cover`;
  mediaAssets.push(img(coverId, `/mock/project-${n}-cover.jpg`, `${p.title} cover`));
  const cover: string = coverId;
  projects.push({
    id: `proj-${n}`,
    title: p.title,
    slug: p.slug,
    category_id: p.cat,
    event_type: p.title,
    summary: `A beautifully designed ${p.title.toLowerCase()} by 3 Star Decoration.`,
    description: `<p>${p.title} — full event design, styling, and floral by 3 Star Decoration.</p>`,
    cover_media_asset_id: cover,
    client_name: null,
    location: "Chennai",
    event_date: `2025-${String((i % 12) + 1).padStart(2, "0")}-12`,
    completion_date: `2025-${String((i % 12) + 1).padStart(2, "0")}-13`,
    project_status: "completed",
    featured_on_homepage: Boolean(p.featured),
    sort_order: i,
    workflow_status: "published",
    published_at: "2026-01-01T00:00:00.000Z",
    meta_title: `${p.title} | 3 Star Decoration`,
    meta_description: `${p.title} event decoration portfolio.`,
    og_media_asset_id: cover,
    auto_seo_generated: true,
    robots_index: true,
    robots_follow: true,
    deleted_at: null,
  });
  for (let g = 1; g <= 4; g++) {
    const gid = `media-${p.slug}-${g}`;
    mediaAssets.push(img(gid, `/mock/project-${n}-${g}.jpg`, `${p.title} photo ${g}`));
    projectMedia.push({
      id: `pm-${n}-${g}`,
      project_id: `proj-${n}`,
      media_asset_id: gid,
      caption: null,
      sort_order: g,
    });
  }
});

export const galleries: Gallery[] = [
  { id: "gal-home", title: "Homepage Featured", slug: "homepage-featured", description: null, category_id: null, type: "homepage_featured", is_active: true, sort_order: 1, deleted_at: null },
  { id: "gal-wedding", title: "Wedding Gallery", slug: "wedding", description: null, category_id: "cat-wedding", type: "standard", is_active: true, sort_order: 2, deleted_at: null },
  { id: "gal-instagram", title: "Instagram", slug: "instagram", description: null, category_id: null, type: "instagram", is_active: true, sort_order: 3, deleted_at: null },
];

export const galleryItems: GalleryItem[] = mediaAssets.slice(0, 9).map((m, i) => ({
  id: `gi-${i + 1}`,
  gallery_id: "gal-home",
  media_asset_id: m.id,
  caption: null,
  sort_order: i,
}));

export const services: Service[] = [
  "Wedding Decoration",
  "Reception Styling",
  "Engagement Setups",
  "Birthday & Baby Shower",
  "Corporate Events",
  "Stage & Backdrop Design",
].map((title, i) => ({
  id: `svc-${i + 1}`,
  title,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  short_description: `${title} by 3 Star Decoration.`,
  description: `<p>${title} — premium, bespoke design.</p>`,
  icon: "sparkles",
  media_asset_id: null,
  sort_order: i,
  workflow_status: "published",
  published_at: "2026-01-01T00:00:00.000Z",
  meta_title: `${title} | 3 Star Decoration`,
  meta_description: `${title} services.`,
  og_media_asset_id: null,
  robots_index: true,
  robots_follow: true,
  deleted_at: null,
}));

export const testimonials: Testimonial[] = [
  { id: "tst-1", author_name: "Priya & Arun", event_type: "Wedding", quote: "Every corner felt like a dream. Flawless styling.", rating: 5, media_asset_id: null, sort_order: 0, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
  { id: "tst-2", author_name: "Meera", event_type: "Baby Shower", quote: "So elegant and personal. Guests are still talking about it.", rating: 5, media_asset_id: null, sort_order: 1, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
  { id: "tst-3", author_name: "Sundar Corp", event_type: "Corporate", quote: "Professional, on time, and visually stunning.", rating: 5, media_asset_id: null, sort_order: 2, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
  { id: "tst-4", author_name: "Kavya", event_type: "Engagement", quote: "The stage took my breath away.", rating: 5, media_asset_id: null, sort_order: 3, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
  { id: "tst-5", author_name: "Rahul", event_type: "Birthday", quote: "Magical setup for our daughter's first birthday.", rating: 5, media_asset_id: null, sort_order: 4, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
];

export const heroBanners: HeroBanner[] = [
  { id: "hero-1", media_asset_id: mediaAssets[0]?.id ?? null, eyebrow: "3 Star Decoration", title: "Celebrations, beautifully designed", subtitle: "Weddings · Receptions · Every occasion", cta_label: "View our work", cta_href: "/portfolio", layout_type: "fullscreen_image", sort_order: 1, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z" },
  { id: "hero-2", media_asset_id: mediaAssets[4]?.id ?? null, eyebrow: "Bespoke event styling", title: "Cinematic. Elegant. Unforgettable.", subtitle: null, cta_label: "Get a quote", cta_href: "/quote", layout_type: "split", sort_order: 2, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z" },
];

export const homepageSections: HomepageSection[] = [
  { id: "hs-1", section_key: "hero", is_enabled: true, sort_order: 1, is_featured: false, config: {} },
  { id: "hs-2", section_key: "featured_works", is_enabled: true, sort_order: 2, is_featured: true, config: {} },
  { id: "hs-3", section_key: "featured_services", is_enabled: true, sort_order: 3, is_featured: false, config: {} },
  { id: "hs-4", section_key: "testimonials", is_enabled: true, sort_order: 4, is_featured: false, config: {} },
  { id: "hs-5", section_key: "instagram", is_enabled: true, sort_order: 5, is_featured: false, config: {} },
  { id: "hs-6", section_key: "quote_cta", is_enabled: true, sort_order: 6, is_featured: false, config: {} },
];

export const siteSettings: SiteSettings = {
  business_phone: "+91 00000 00000",
  whatsapp_number: "910000000000",
  whatsapp_message_template: "Hi 3 Star Decoration, I'd like a quote. {details}",
  business_email: "hello@example.com",
  address: "Chennai, India",
  google_map_embed: null,
  social_links: { instagram: "", facebook: "", youtube: "" },
  homepage_content: {},
  ga4_measurement_id: null,
  gsc_verification_token: null,
  canonical_base_url: "http://localhost:3000",
  site_name: "3 Star Decoration",
  default_meta_title: "3 Star Decoration — Premium Event Decoration",
  default_meta_description: "Weddings, receptions, and celebrations, beautifully designed.",
  default_og_media_asset_id: null,
};

export const seoMeta: SeoMeta[] = [
  { route_key: "home", meta_title: "3 Star Decoration — Premium Event Decoration", meta_description: "Weddings, receptions, and celebrations, beautifully designed.", og_media_asset_id: null, canonical: null, robots_index: true, robots_follow: true },
  { route_key: "portfolio", meta_title: "Our Work | 3 Star Decoration", meta_description: "Explore our event decoration portfolio.", og_media_asset_id: null, canonical: null, robots_index: true, robots_follow: true },
];

export const legalPages: LegalPage[] = [
  { slug: "privacy", title: "Privacy Policy", body: "<p>Placeholder privacy policy.</p>", updated_at: "2026-01-01T00:00:00.000Z" },
  { slug: "terms", title: "Terms & Conditions", body: "<p>Placeholder terms.</p>", updated_at: "2026-01-01T00:00:00.000Z" },
];
