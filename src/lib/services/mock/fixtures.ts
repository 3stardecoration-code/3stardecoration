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

// ---------------------------------------------------------------------------
// ⚠️ TEMPORARY DEMONSTRATION ASSETS — NOT the client's content.
// The images referenced below live in /public/demo-assets and are royalty-free
// luxury-event photos (Unsplash) used ONLY to present a production-ready demo.
// When the client's real photos/videos are uploaded through the Media Library
// (Cloudinary), the Supabase adapter replaces these fixtures entirely — NO
// layout/markup change is needed, because every consumer reads a MediaAsset's
// secure_url / width / height / dominant_color, never a hard-coded path.
// Aspect ratios are preserved to match the CMS: event photos 1600×1067 (3:2),
// hero images 2400×1350 (16:9). Attribution: public/demo-assets/README.md.
// ---------------------------------------------------------------------------

// Real average colours of the demo images, for blur-up / progressive loading.
const DEMO_COLORS: Record<string, string> = {
  "wedding-01": "#50473d", "wedding-02": "#b06b38", "wedding-03": "#644834",
  "wedding-04": "#a2988a", "wedding-05": "#757e6f", "wedding-06": "#aba28e",
  "reception-01": "#b8ac9d", "reception-02": "#75532b", "reception-03": "#7e634e", "reception-04": "#a28a67",
  "stage-01": "#a17b59", "stage-02": "#6d5042", "stage-03": "#786957", "stage-04": "#813470", "stage-05": "#5c226a",
  "floral-01": "#57524e", "floral-02": "#8c6d49", "floral-03": "#584f3d", "floral-04": "#816948", "floral-05": "#d2c0af", "floral-06": "#9eae8c",
  "corporate-01": "#6e417d", "corporate-02": "#2f1e34", "corporate-03": "#6a5441", "corporate-04": "#6c6e6d",
  "hero-01": "#b16c39", "hero-02": "#a47d5a",
};

// Build a MediaAsset that points at a /demo-assets image (temporary demo content).
function demoImg(id: string, asset: string, alt: string, w = 1600, h = 1067): MediaAsset {
  return {
    id,
    source: "cloudinary_image",
    public_id: null,
    provider_id: null,
    secure_url: `/demo-assets/${asset}.jpg`,
    thumbnail_url: `/demo-assets/${asset}.jpg`,
    width: w,
    height: h,
    duration: null,
    format: "jpg",
    file_size: null,
    alt_text: alt,
    title: alt,
    caption: null,
    tags: [],
    dominant_color: DEMO_COLORS[asset] ?? "#d8cfc4",
    blur_placeholder: null,
    favorite: false,
    uploaded_by: null,
    uploaded_at: "2026-01-01T00:00:00.000Z",
    usage_count: 1,
    deleted_at: null,
  };
}

// Category → ordered pool of demo-asset basenames. index 0 suits the 1st project
// in the category, index 1 the 2nd (rotation below), remaining used for galleries.
const CATEGORY_IMAGES: Record<string, string[]> = {
  "cat-wedding": ["wedding-04", "wedding-02", "wedding-06", "wedding-03", "wedding-05", "wedding-01"],
  "cat-reception": ["reception-04", "reception-03", "reception-02", "reception-01", "floral-05", "wedding-05"],
  "cat-engagement": ["floral-04", "wedding-01", "floral-05", "wedding-06", "floral-01", "wedding-03"],
  "cat-birthday": ["floral-02", "stage-04", "stage-05", "corporate-02", "floral-03", "floral-06"],
  "cat-baby-shower": ["floral-05", "floral-06", "floral-04", "floral-01", "reception-01", "wedding-04"],
  "cat-corporate": ["corporate-03", "corporate-04", "corporate-01", "corporate-02", "reception-02", "stage-03"],
  "cat-stage": ["stage-01", "stage-02", "stage-03", "stage-05", "stage-04", "floral-02"],
};

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
const projectCoverIds: string[] = [];

// Two projects share each category; this rotates the pool so their covers differ.
const perCategoryIndex: Record<string, number> = {};

projectSeed.forEach((p, i) => {
  const n = String(i + 1).padStart(2, "0");
  const pool = CATEGORY_IMAGES[p.cat] ?? ["wedding-01"];
  const rot = (perCategoryIndex[p.cat] = (perCategoryIndex[p.cat] ?? -1) + 1);
  const pick = (slot: number) => pool[(slot + rot) % pool.length];

  const coverId = `media-${p.slug}-cover`;
  mediaAssets.push(demoImg(coverId, pick(0), `${p.title} — cover`));
  projectCoverIds.push(coverId);

  projects.push({
    id: `proj-${n}`,
    title: p.title,
    slug: p.slug,
    category_id: p.cat,
    event_type: p.title,
    summary: `A beautifully designed ${p.title.toLowerCase()} by 3 Star Decoration.`,
    description: `<p>${p.title} — full event design, styling, and floral by 3 Star Decoration.</p>`,
    cover_media_asset_id: coverId,
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
    og_media_asset_id: coverId,
    auto_seo_generated: true,
    robots_index: true,
    robots_follow: true,
    deleted_at: null,
  });

  for (let g = 1; g <= 4; g++) {
    const gid = `media-${p.slug}-${g}`;
    mediaAssets.push(demoImg(gid, pick(g), `${p.title} — photo ${g}`));
    projectMedia.push({
      id: `pm-${n}-${g}`,
      project_id: `proj-${n}`,
      media_asset_id: gid,
      caption: null,
      sort_order: g,
    });
  }
});

// Two dedicated 16:9 hero images (temporary demo assets), added to the library
// so hero_banners.media_asset_id resolves through media.getById().
mediaAssets.push(
  demoImg("media-hero-01", "hero-01", "Elegant wedding celebration", 2400, 1350),
  demoImg("media-hero-02", "hero-02", "Ornate stage decoration", 2400, 1350),
);

// Before/After showcase pair (homepage-only signature moment) — a genuinely
// bare venue paired with a fully styled hall, both 16:9 to match the slider.
export const BEFORE_AFTER_IDS = { before: "media-before-hall", after: "media-hero-01" } as const;
mediaAssets.push(
  demoImg(BEFORE_AFTER_IDS.before, "before-empty-hall", "Bare venue before styling", 2400, 1350),
);

// Moody background for the homepage's glassmorphism testimonials section.
export const TESTIMONIALS_BG_ID = "media-testimonials-bg";
mediaAssets.push(demoImg(TESTIMONIALS_BG_ID, "wedding-01", "Candlelit celebration", 2400, 1600));

export const galleries: Gallery[] = [
  { id: "gal-home", title: "Homepage Featured", slug: "homepage-featured", description: null, category_id: null, type: "homepage_featured", is_active: true, sort_order: 1, deleted_at: null },
  { id: "gal-wedding", title: "Wedding Gallery", slug: "wedding", description: null, category_id: "cat-wedding", type: "standard", is_active: true, sort_order: 2, deleted_at: null },
  { id: "gal-instagram", title: "Instagram", slug: "instagram", description: null, category_id: null, type: "instagram", is_active: true, sort_order: 3, deleted_at: null },
];

// Homepage featured gallery: one cover per project (first 9 → spans categories).
export const galleryItems: GalleryItem[] = projectCoverIds.slice(0, 9).map((mediaId, i) => ({
  id: `gi-${i + 1}`,
  gallery_id: "gal-home",
  media_asset_id: mediaId,
  caption: null,
  sort_order: i,
}));

const SERVICE_SEED: Array<{ title: string; blurb: string; asset: string }> = [
  { title: "Wedding Decoration", blurb: "Full-scale design for the one day you'll replay forever.", asset: "wedding-02" },
  { title: "Reception Styling", blurb: "Tablescapes and lighting that keep the evening glowing.", asset: "reception-02" },
  { title: "Engagement Setups", blurb: "An intimate scene for the moment you say yes.", asset: "floral-04" },
  { title: "Birthday & Baby Shower", blurb: "Playful, considered styling for milestones big and small.", asset: "floral-02" },
  { title: "Corporate Events", blurb: "Brand-worthy staging for launches, galas, and gatherings.", asset: "corporate-03" },
  { title: "Stage & Backdrop Design", blurb: "Statement backdrops built to hold the room's attention.", asset: "stage-01" },
];

export const services: Service[] = SERVICE_SEED.map(({ title, blurb, asset }, i) => {
  const mediaId = `media-svc-${i + 1}`;
  mediaAssets.push(demoImg(mediaId, asset, `${title} by 3 Star Decoration`));
  return {
    id: `svc-${i + 1}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    short_description: blurb,
    description: `<p>${blurb}</p><p>Every detail — florals, drapery, lighting, and staging — designed as one cohesive scene, not a checklist of add-ons.</p>`,
    icon: "sparkles",
    media_asset_id: mediaId,
    sort_order: i,
    workflow_status: "published",
    published_at: "2026-01-01T00:00:00.000Z",
    meta_title: `${title} | 3 Star Decoration`,
    meta_description: blurb,
    og_media_asset_id: mediaId,
    robots_index: true,
    robots_follow: true,
    deleted_at: null,
  };
});

export const testimonials: Testimonial[] = [
  { id: "tst-1", author_name: "Priya & Arun", event_type: "Wedding", quote: "Every corner felt like a dream. Flawless styling.", rating: 5, media_asset_id: null, sort_order: 0, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
  { id: "tst-2", author_name: "Meera", event_type: "Baby Shower", quote: "So elegant and personal. Guests are still talking about it.", rating: 5, media_asset_id: null, sort_order: 1, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
  { id: "tst-3", author_name: "Sundar Corp", event_type: "Corporate", quote: "Professional, on time, and visually stunning.", rating: 5, media_asset_id: null, sort_order: 2, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
  { id: "tst-4", author_name: "Kavya", event_type: "Engagement", quote: "The stage took my breath away.", rating: 5, media_asset_id: null, sort_order: 3, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
  { id: "tst-5", author_name: "Rahul", event_type: "Birthday", quote: "Magical setup for our daughter's first birthday.", rating: 5, media_asset_id: null, sort_order: 4, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z", deleted_at: null },
];

export const heroBanners: HeroBanner[] = [
  { id: "hero-1", media_asset_id: "media-hero-01", eyebrow: "3 Star Decoration", title: "Celebrations, beautifully designed", subtitle: "Weddings · Receptions · Every occasion", cta_label: "View our work", cta_href: "/portfolio", layout_type: "fullscreen_image", sort_order: 1, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z" },
  { id: "hero-2", media_asset_id: "media-hero-02", eyebrow: "Bespoke event styling", title: "Cinematic. Elegant. Unforgettable.", subtitle: null, cta_label: "Get a quote", cta_href: "/quote", layout_type: "split", sort_order: 2, workflow_status: "published", published_at: "2026-01-01T00:00:00.000Z" },
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

// NOTE: generic starter copy, editable via the CMS (Legal Pages, spec §4.12).
// Not a substitute for the client's own legal/compliance review before launch.
export const legalPages: LegalPage[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    updated_at: "2026-01-01T00:00:00.000Z",
    body: `
      <p>3 Star Decoration ("we", "us") respects your privacy. This policy explains what
      information we collect when you use this website and get in touch with us, and how
      we use it.</p>

      <h2>Information we collect</h2>
      <p>When you submit a quote request or contact form, we collect the details you
      provide — your name, phone number, email address, and information about your event
      (type, date, city, venue, guest count, budget, and any message you send us).</p>

      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiry and discuss your event with you, usually over WhatsApp or phone.</li>
        <li>To prepare quotes and proposals tailored to your celebration.</li>
        <li>To keep a record of past enquiries so we can serve returning clients better.</li>
      </ul>
      <p>We do not sell your information to third parties.</p>

      <h2>WhatsApp</h2>
      <p>Submitting the quote form opens a WhatsApp conversation with our team using the
      details you provided. WhatsApp's own privacy policy applies to messages sent through
      that platform.</p>

      <h2>Your choices</h2>
      <p>You can ask us at any time to review, correct, or delete the information we hold
      about you by reaching out through the Contact page.</p>

      <h2>Contact us</h2>
      <p>Questions about this policy can be sent to the email address listed on our
      Contact page.</p>
    `,
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    updated_at: "2026-01-01T00:00:00.000Z",
    body: `
      <p>These terms apply when you enquire about or book event decoration services with
      3 Star Decoration ("we", "us"). By submitting an enquiry or confirming a booking, you
      agree to the terms below.</p>

      <h2>Quotes and bookings</h2>
      <p>Quotes shared over WhatsApp, email, or in person are estimates based on the
      details provided and may be revised once we understand your event in full. A
      booking is confirmed only once both parties agree on scope, pricing, and date.</p>

      <h2>Changes and cancellations</h2>
      <p>We understand event plans change. Please let us know about date changes,
      guest-count changes, or cancellations as early as possible so we can adjust
      sourcing, staffing, and materials accordingly.</p>

      <h2>On the day</h2>
      <p>We arrive with enough time to set up, style, and finish every detail before your
      event begins, and typically handle breakdown after the event concludes, as agreed
      in your booking.</p>

      <h2>Liability</h2>
      <p>We take care to protect venues and property while working, and carry appropriate
      care for the materials and installations we bring. Specific liability terms for
      your event are confirmed as part of your booking.</p>

      <h2>Contact us</h2>
      <p>If anything here is unclear, reach out through our Contact page before booking —
      we're happy to talk it through.</p>
    `,
  },
];
