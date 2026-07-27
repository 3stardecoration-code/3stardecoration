# 3 Star Decoration — Design Specification

**Status:** Frozen (v1) · **Date:** 2026-07-27
**Product:** Premium, cinematic event-decoration portfolio website + admin CMS
**Repo:** `3stardecoration` · **Spec owner:** ALLWIN E

---

## 1. Vision & Goals

Build an **award-winning-portfolio-grade** website for 3 Star Decoration (weddings, receptions, engagements, birthdays, baby showers, corporate events, stage & all event decoration). The site is **visual-first**: photography and video carry the story; the UI is a quiet, editorial frame. The owner manages 100% of content through a **premium, SaaS-grade admin CMS** — no code required.

### Goals
- Cinematic, luxury, minimal aesthetic that feels exclusive, not templated.
- Every image/video/banner on the public site is **dynamically loaded** from the CMS.
- Strong SEO + Core Web Vitals (marketing site must be found in local search).
- A CMS that is a pleasure to use: fast, forgiving (Recycle Bin, undo), and safe.

### Non-Goals (v1) — architecture must accommodate, not implement
Blog · Packages & Pricing · Online Booking · Payment Gateway · Customer Dashboard · AI Image Tagging · AI SEO Suggestions · Multi-language · Multi-admin (schema-ready, single owner in v1). See §16.

### Quality targets (Lighthouse, production)
| Metric | Target |
|---|---|
| Performance | ≥ 95 |
| SEO | 100 (Lighthouse caps at 100) |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| Layout shift (CLS) | ≈ 0, no visible shifts |
| Motion | 60 FPS, `prefers-reduced-motion` honored |

Also required: pixel-perfect responsiveness, fast initial load, professional & maintainable code.

---

## 2. Tech Stack & Architecture

| Layer | Choice |
|---|---|
| Framework | **Next.js (App Router)** + TypeScript |
| Styling | **Tailwind CSS** + design tokens (CSS variables) |
| Motion | **GSAP** (+ ScrollTrigger), **Lenis** smooth scroll, **R3F/Three** for sparing 3D |
| Data | **Supabase Postgres** (data) + **Supabase Auth** (admin) + **Row-Level Security** |
| Media | **Cloudinary** (images + short hero-loop videos); **YouTube/Vimeo** (long portfolio films) |
| Deploy | **Vercel** (Next.js) + managed Supabase + Cloudinary |
| Analytics | GA4 (tracking wired v1; in-CMS GA4 Data API embed deferred to v2) |

**Single codebase**, full-stack Next.js. Public site + admin dashboard live in one Next.js app. Supabase Storage is **not** used — all media is on Cloudinary; the DB stores references + metadata.

### Rendering strategy
| Surface | Strategy |
|---|---|
| Home, Services, About, Contact, Privacy, Terms | **SSG** |
| Portfolio listing | **ISR** (paginated, see §9.3) |
| Portfolio detail | **ISR + on-demand revalidation** on publish/edit |
| Preview routes | **Dynamic, authenticated, `no-store`** (see §8.2) |
| Admin dashboard | **Fully dynamic** |
| 404 | Custom static page |

---

## 3. SEO Strategy

Baked in from Phase 1:
- Dynamic **Metadata API** per route; **Open Graph** + **Twitter Cards**.
- **`sitemap.xml`** and **`robots.txt`** (generated; sitemap filters to `workflow_status='published' AND deleted_at IS NULL`).
- **Canonical URLs** on every page.
- **JSON-LD**: `LocalBusiness` (site-wide) + `BreadcrumbList` (portfolio/detail).
- **Image ALT** everywhere — auto-suggested on publish, editable.
- **`next/image`** optimization with a **custom Cloudinary loader** (`images.loaderFile`) so transforms run on Cloudinary and off Vercel's image quota. *(Frozen decision — retrofitting touches every image call site.)*
- **Core Web Vitals** budgets enforced in Phase 6.
- **Google Search Console** verification token + **GA4** measurement ID stored in `site_settings`, injected site-wide.
- **Auto-SEO on publish** for projects (see §8.4).

---

## 4. Data Model (Supabase Postgres)

Conventions: all tables `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at` maintained by trigger. Soft-deletable tables add `deleted_at timestamptz`, `deleted_by uuid`. Rich text stored as sanitized HTML (see §12).

### 4.1 `media_assets` — the Media Library
| Column | Type | Notes |
|---|---|---|
| `source` | enum | `cloudinary_image` \| `cloudinary_video` \| `youtube` \| `vimeo` |
| `public_id` | text | Cloudinary public_id (cloudinary sources) |
| `provider_id` | text | YouTube/Vimeo video id (external sources) |
| `secure_url` | text | canonical URL |
| `thumbnail_url` | text | poster/thumbnail |
| `width`,`height`,`duration` | int | duration for video |
| `format` | text | e.g. jpg, mp4 |
| `file_size` | bigint | bytes |
| `alt_text`, `title`, `caption` | text | |
| `tags` | text[] | for search/filter |
| `dominant_color` | text | hex; derived server-side from blur thumbnail |
| `blur_placeholder` | text | **base64 data URI** (for `placeholder="blur"`) |
| `favorite` | bool | |
| `uploaded_by` | uuid → auth.users | |
| `uploaded_at` | timestamptz | |
| `deleted_at`, `deleted_by` | | Recycle Bin |

`usage_count` is **not stored** — it is a **view/computed** aggregate over every referencing table (see §4.16), to avoid drift.

### 4.2 `categories`
`name`, `slug`, `description`, `sort_order`, `cover_media_asset_id → media_assets`.
Seeded: Wedding, Reception, Engagement, Birthday, Baby Shower, Corporate, Stage.

### 4.3 `hero_banners`
`media_asset_id`, `eyebrow`, `title`, `subtitle`, `cta_label`, `cta_href`, `sort_order`, **`workflow_status`** (draft\|published\|unpublished), `published_at`.

### 4.4 `projects` (portfolio)
`title`, `slug`, `category_id → categories`, `event_type`, `summary`, `description` (sanitized HTML), `cover_media_asset_id`, `client_name` (nullable), `location`, `event_date`, `completion_date`, **`project_status`** (upcoming\|ongoing\|completed — lifecycle badge), **`featured_on_homepage`** bool, `sort_order`, **`workflow_status`** (draft\|published\|unpublished), `published_at`, `meta_title`, `meta_description`, `og_media_asset_id`, `auto_seo_generated` bool, `deleted_at`, `deleted_by`.

> Two orthogonal statuses by design: `workflow_status` = publish lifecycle; `project_status` = event lifecycle shown as a badge.

### 4.5 `project_media`
`project_id → projects`, `media_asset_id → media_assets`, `caption`, `sort_order`. Ordered gallery per project.

### 4.6 `galleries` / `gallery_items`
`galleries`: `title`, `slug`, `description`, `category_id` (nullable), `type` (standard\|homepage_featured\|instagram), `is_active`, `sort_order`, `deleted_at`, `deleted_by`.
`gallery_items`: `gallery_id → galleries`, `media_asset_id → media_assets`, `caption`, `sort_order`.
Galleries **only reference** Media Library assets — never duplicate media. Examples: Homepage Featured, Wedding, Reception, Birthday, Corporate, Instagram.

### 4.7 `services`
`title`, `slug`, `short_description`, `description`, `icon` (lucide name) or `media_asset_id`, `sort_order`, **`workflow_status`**, `published_at`, `meta_title`, `meta_description`, `og_media_asset_id`, `deleted_at`, `deleted_by`.

### 4.8 `testimonials`
`author_name`, `event_type`, `quote`, `rating` (1–5), `media_asset_id` (avatar, nullable), `sort_order`, **`workflow_status`**, `published_at`, `deleted_at`, `deleted_by`.

### 4.9 `enquiries`
`name`, `phone`, `email` (nullable), `event_type`, `event_date` (nullable), `event_city`, `venue` (nullable), `guest_count` (nullable), `budget_range`, `preferred_contact_time`, `message`, `status` (new\|contacted\|closed), `assigned_to → auth.users` (nullable, future), `notes` (internal admin only), `source` (quote_form\|contact_form), `ip`, `user_agent`, `created_at`, `updated_at`. **Not** soft-deleted (records kept).

### 4.10 `site_settings` (singleton)
`business_phone`, `whatsapp_number`, `whatsapp_message_template`, `business_email`, `address`, `google_map_embed`, `social_links` jsonb, `homepage_content` jsonb (hero fallback copy, section headings, about blurb, stats), `ga4_measurement_id`, `gsc_verification_token`, `canonical_base_url`, `site_name`, `default_meta_title`, `default_meta_description`, `default_og_media_asset_id`, `updated_at`, `updated_by`.

### 4.11 `seo_meta` (per-route overrides)
`route_key` (unique: home\|portfolio\|services\|about\|contact\|quote…), `meta_title`, `meta_description`, `og_media_asset_id`, `canonical` (nullable).

### 4.12 `legal_pages`
`slug` (privacy\|terms), `title`, `body` (sanitized HTML), `updated_at`, `updated_by`.

### 4.13 `admin_profiles`
`user_id` pk → auth.users, `full_name`, `avatar_media_asset_id`, `role` (owner\|admin), timestamps. Powers User Profile; future multi-admin.

### 4.14 `audit_logs` (Security requirement)
`actor_user_id`, `action`, `entity_type`, `entity_id`, `diff` jsonb, `ip`, `user_agent`, `created_at`. **Insert-only** — RLS forbids update/delete even for admins. Every admin mutation writes one row.

### 4.15 `rate_limits` (serverless-safe)
`key` (text, e.g. `ip:action`), `window_start` timestamptz, `count` int. Backed by Postgres (see §12) so limits are shared across serverless invocations.

### 4.16 Derived: `usage_count`
A SQL **view** aggregating references to each `media_asset` across: `project_media`, `gallery_items`, `hero_banners.media_asset_id`, `projects.cover_media_asset_id`/`og_media_asset_id`, `services.media_asset_id`/`og_media_asset_id`, `testimonials.media_asset_id`, `categories.cover_media_asset_id`, `seo_meta.og_media_asset_id`, `site_settings.default_og_media_asset_id`, `admin_profiles.avatar_media_asset_id`. The Media Library reads `usage_count` from this view.

---

## 5. Row-Level Security & Public Read Safety

- **Supabase Auth** (email/password) with `@supabase/ssr` cookie sessions in Next.js.
- **RLS on every table.** Anonymous (public site) may only read **published, non-deleted** rows. All writes and all draft reads require an authenticated admin.
- **Public reads go through Postgres views** that bake in the predicate `workflow_status = 'published' AND deleted_at IS NULL` (or `is_active AND deleted_at IS NULL` for galleries). Views used: `public_projects`, `public_project_media`, `public_services`, `public_testimonials`, `public_hero_banners`, `public_galleries`, `public_gallery_items`, `public_categories`, `public_media_assets`. This makes it **impossible to forget** the trashed/draft predicate per-query — a single missed policy would otherwise leak trashed content to the live site.
- **Slug uniqueness with Recycle Bin:** partial unique index `UNIQUE (slug) WHERE deleted_at IS NULL` on `projects`, `services`, `galleries`. A trashed row no longer blocks recreating its slug.
- Cloudinary signing, on-demand revalidation, and privileged writes run server-side (Server Actions / Route Handlers) using the appropriate key.

---

## 6. Media Library & Cloudinary Integration

**Upload flow (no server file-proxying):**
1. Admin selects a file → Server Action returns a **signed Cloudinary upload signature**.
2. Browser uploads **directly to Cloudinary**.
3. Cloudinary returns `public_id` + metadata.
4. Server Action inserts the `media_assets` row and, at upload time, generates:
   - `blur_placeholder` — tiny Cloudinary transform fetched server-side → **base64 data URI**.
   - `dominant_color` — derived server-side from the blur thumbnail (not a plan-gated Cloudinary add-on).
   - `alt_text` — auto-suggested (editable).

**External videos:** admin pastes a YouTube/Vimeo URL → fetch oEmbed thumbnail + store `provider_id`, `thumbnail_url`. Reusable like any asset.

**Reuse:** every module references assets by `media_asset_id`. No duplicate uploads, ever.

**Recycle Bin & referential safety:**
- Trashing an asset that is **referenced** (`usage_count > 0`) is **blocked**; the UI shows *where* it is used and requires removing references first.
- **Permanent delete** of an asset also **destroys the Cloudinary resource** (server-side) to avoid orphan storage cost.
- FK behavior on the ~10 referencing columns: `RESTRICT` on delete for reference integrity; nullable reference columns use `SET NULL` only where a missing image degrades gracefully (documented per-column in the migration).

**Library UX:** search (title/tags/alt), filter by Image/Video, filter by Category, sort Latest/Oldest, favorite toggle, **bulk select + bulk delete** (bulk delete = move to Recycle Bin, subject to the reference rule above).

---

## 7. Content Workflow

### 7.1 Applies to
Draft / Preview / Publish / Unpublish workflow (`workflow_status`) applies to **Projects, Services, Testimonials, Hero Banners**. Galleries use `is_active` (published on/off). Categories are always live.

### 7.2 Preview (resolves the RLS/ISR contradiction)
Preview is a **dynamic, authenticated, `no-store`** route that reads drafts via the admin's cookie session (or service role) — it is **never** ISR-cached and never served to anon. `generateStaticParams` and `sitemap.xml` include only published, non-deleted rows.

### 7.3 Autosave (resolves the autosave/publish contradiction)
Autosave applies **only while `workflow_status = 'draft'`**. Editing a **published** item requires an explicit **Save**, which then triggers on-demand revalidation. Published content is never silently mutated by autosave.

### 7.4 Auto-SEO on publish (Projects)
On publish, auto-generate (all editable afterward):
- **Meta Title** — from title + category + brand template.
- **Meta Description** — templated from summary/location/event_type.
- **Open Graph image** — Cloudinary transform of the cover asset (correct OG dimensions).
- **Slug validation** — uniqueness (partial index) + format normalization.
- **Image ALT suggestions** — heuristic from project + category context (AI enhancement is a v2 hook, see §14).
- **Schema markup** — `BreadcrumbList` + relevant structured data emitted for the detail page.

### 7.5 Recycle Bin
Soft-delete (`deleted_at`/`deleted_by`) for **Projects, Galleries, Media, Testimonials, Services**. Trash view supports **Restore** and **Delete Permanently** (permanent media delete also purges Cloudinary). Public views exclude trashed rows by construction (§5).

---

## 8. Public Site — Pages & Signature Experiences

### 8.1 Pages
`/` · `/portfolio` · `/portfolio/[slug]` · `/services` · `/about` · `/contact` · `/quote` · `/privacy` · `/terms` · custom `404`.

### 8.2 Home
Cinematic hero (video loop) → featured works (`featured_on_homepage`) → featured services → testimonials → **Instagram section** (a gallery of type `instagram`) → WhatsApp CTA.

### 8.3 Premium loading experience (resolves preloader vs. CLS)
- **First visit only** (cookie/localStorage gate).
- Hero content renders **underneath immediately**; the overlay **fades over** it — LCP is not blocked.
- Loading percentage is driven by **real asset load events**, not a timer.
- Elegant logo animation → cinematic reveal → smooth hand-off into the homepage.
- Crawlers and no-JS visitors receive the **full content** (overlay is progressive enhancement).

### 8.4 Navigation
Transparent over hero → **frosted-glass blur** after scroll · smooth active-section indicator · elegant **fullscreen mobile menu** with animated transitions.

### 8.5 Portfolio (the heart)
- Large **editorial masonry** layout.
- Smooth **category transitions** (FLIP).
- **Load More that appends, backed by real paginated URLs** (`/portfolio?page=N`) so crawlers get links — *not* pure infinite scroll (SEO).
- Luxury hover interactions; **fullscreen immersive lightbox** with **keyboard navigation** and **mobile swipe**.
- Each project detail reads like a premium magazine spread (full-bleed gallery, sticky captions).

### 8.6 Image experience
Progressive loading · **blur placeholder** (base64) · fade reveal · smooth zoom · `priority` on hero images, lazy below the fold. No sudden pops; no layout shift.

### 8.7 Motion guidelines
Motion enhances, never decorates for its own sake. 60 FPS target · full `prefers-reduced-motion` fallbacks · **desktop and mobile motion tuned separately** (reduced complexity + battery awareness on mobile).

---

## 9. Admin CMS — Modules & UX

**Modules:** Dashboard · Hero Banner Management · Portfolio Management · Gallery Management · Services Management · Testimonials · Enquiries · Homepage Settings · Contact & Social Links · SEO Settings · Analytics Overview · User Profile · Media Library · **Recycle Bin**.

**SaaS-grade UX (applies across modules):**
- Beautiful, consistent dashboard UI.
- **Drag-and-drop sorting** — persisted via a **single transactional bulk-reorder** call taking `[{id, sort_order}]` (never N updates).
- **Search everywhere** · **keyboard shortcuts** · **confirmation dialogs** for destructive actions · **toast notifications** · **autosave** (draft only, §7.3) · **undo** for quick actions.

---

## 10. Enquiry → WhatsApp Flow

`/quote` form (name, phone, event_type, event_date, event_city, venue, guest_count, budget_range, preferred_contact_time, message) → **zod-validated Server Action** → insert `enquiries` (status `new`) → client builds `https://wa.me/<whatsapp_number>?text=<pre-filled summary>` from `site_settings` (number + template) and opens it. Owner continues on WhatsApp.

- **Anti-spam:** honeypot field + rate limiting (§12) + validation.
- **Notification interface:** a `NotificationChannel` abstraction with `notifyNewEnquiry(enquiry)`; v1 impl is a no-op/logger. **Email and WhatsApp-API channels drop in later with zero schema change.**

---

## 11. Analytics Overview (v1 — internal KPIs)

**KPI cards:** Total Enquiries · New Enquiries · Contacted · Closed · Portfolio Projects · Published Galleries · Media Assets · Featured Projects.
**Charts:** Monthly enquiries · Event-category distribution · Budget distribution · Popular services.
All DB-derived. GA4 Data API embed = **v2**.

---

## 12. Security

- **CSRF:** route **all admin mutations through Server Actions**, satisfied by Next.js Origin/Host verification + `serverActions.allowedOrigins` (prod domain). Any mutation exposed as a **Route Handler** gets explicit CSRF handling. The mutation mechanism per surface is documented in the plan.
- **Rate limiting:** **Postgres-backed** counters (`rate_limits`) shared across serverless invocations — in-memory limiters do not work on Vercel. (Upstash/Vercel KV is the alt if a shared cache is later added.)
- **Input sanitization:** all rich-text/HTML sanitized on write (server-side allowlist); all inputs zod-validated.
- **Secure headers:** CSP, HSTS, X-Frame-Options/`frame-ancestors`, Referrer-Policy, etc. via Next config/middleware.
- **Environment validation:** typed env schema validated at boot; build fails on missing/invalid vars.
- **Audit logs:** every admin action → insert-only `audit_logs` row (§4.14).

---

## 13. Performance, Accessibility & Motion Budgets

- `next/image` + Cloudinary loader; responsive `sizes`; base64 blur placeholders; `priority` hero, lazy below fold.
- Font-display swap; subset fonts; preconnect to Cloudinary.
- CWV budgets enforced in Phase 6; no CLS.
- A11y: semantic landmarks, keyboard nav, visible focus, ARIA on interactive widgets (lightbox, menu), alt text everywhere, reduced-motion fallbacks.

---

## 14. Future-Ready Architecture (must accommodate, not build)

Design so these add cleanly, without refactoring core:
- **Multiple admin users** — `admin_profiles.role` + RLS already role-aware.
- **Blog** — new content type mirroring the project workflow/SEO pattern.
- **Packages & Pricing / Online Booking / Payment / Customer Dashboard** — new modules + tables; auth layer extends from Supabase Auth.
- **AI Image Tagging / AI SEO** — hook points at media upload (`alt_text`/`tags`) and publish (`meta_*`), swappable behind the existing generation step.
- **Multi-language** — content tables designed to allow a future `locale` dimension; routing via Next i18n.
- **Notification channels** — via the `NotificationChannel` interface (§10).

---

## 15. External Accounts & Inputs (Phase 0)

Logo (SVG) + brand colors/fonts · WhatsApp business number + contact details + social links · **Cloudinary** (cloud name + API key/secret + upload preset) · **Supabase** project (URL + anon + service keys) · **Vercel** account · **GA4** measurement ID + **GSC** token + domain (when ready) · starter batch of real hero video + project photos.

---

## 16. Phased Build Plan & Acceptance Criteria

Built as **one product** across sequential phases; each phase is independently shippable/testable. `writing-plans` will plan **Phase 0–1 first**, not one monolithic plan for all modules.

### Phase 0 · Foundation
Next.js + TS + Tailwind scaffold; design tokens & type system; Lenis/GSAP setup; Supabase project + full schema + RLS + public views + seed categories; Cloudinary wiring + custom image loader; typed env validation; CI.
**Accept:** app boots; migrations apply; RLS blocks anon writes; seeded categories readable via public view; env validation fails fast on missing keys; design tokens render.

### Phase 1 · Public shell + core pages
Nav/footer, Home, Services, About, Contact, Privacy, Terms, 404; full SEO plumbing (metadata, OG/Twitter, sitemap, robots, canonical, LocalBusiness/Breadcrumb JSON-LD, GA4 hook); premium loader; smooth scroll.
**Accept:** all core pages SSG; Lighthouse SEO 100 on Home; metadata/OG correct; sitemap/robots valid; loader is first-visit-only and does not regress LCP/CLS; reduced-motion verified.

### Phase 2 · Portfolio & Galleries (public)
Portfolio listing (masonry, category filters, Load-More paginated URLs), Project detail (ISR + on-demand revalidate), Gallery pages, fullscreen lightbox (keyboard + swipe), Instagram section.
**Accept:** `/portfolio?page=N` crawlable; filters animate without CLS; detail pages ISR + revalidate on publish; lightbox keyboard + swipe pass a11y; images use blur→fade.

### Phase 3 · Admin foundation + Media Library
Supabase Auth + admin shell + RLS enforcement; Media Library (signed Cloudinary upload, all metadata, blur/dominant-color generation, search/filter/sort, bulk select/delete, usage_count view, favorites).
**Accept:** only authenticated admin reaches `/admin`; direct Cloudinary upload works; metadata persisted; `usage_count` accurate; referenced-asset trash blocked; permanent delete purges Cloudinary.

### Phase 4 · Admin content modules
Hero Banners, Projects (Draft→Preview→Publish→Unpublish + Auto-SEO + autosave-in-draft), Services, Testimonials, Galleries, Categories — all with Recycle Bin, drag-and-drop sorting, confirmation dialogs, toasts, undo.
**Accept:** draft preview is authenticated/no-store; publish triggers revalidation + auto-SEO; unpublish removes from public views; soft-delete + restore + permanent-delete work; slug partial-unique holds; reorder is one transactional call; every mutation writes an audit log.

### Phase 5 · Enquiries, Settings, Analytics, Profile
Quote/Contact → enquiry + WhatsApp redirect; Enquiries admin (status/notes/assigned_to); Homepage/Contact-Social/SEO/Legal settings (site-wide `revalidateTag('site-settings')`); Analytics Overview (KPI cards + 4 charts); User Profile; Recycle Bin UI.
**Accept:** enquiry stored then WhatsApp opens with correct prefilled text; honeypot + rate-limit effective; settings edits revalidate every page (phone/WhatsApp update sitewide); KPIs/charts match DB; legal pages editable and live.

### Phase 6 · Polish & launch
CWV + a11y hardening; OG-image generation finalized; GSC/sitemap submission readiness; real-content seeding; full QA; Vercel deploy.
**Accept:** production Lighthouse meets §1 targets; no CLS; GSC verified; sitemap submitted; real content live.

---

## 17. Frozen Decisions Log (resolved contradictions)

1. **Preview** = dynamic, authenticated, `no-store`; static generation & sitemap only include published+non-deleted.
2. **Autosave** = draft-only; published edits require explicit Save + revalidate.
3. **Portfolio pagination** = Load-More appending over real paginated URLs (not infinite scroll).
4. **Preloader** = hero renders underneath; overlay fades over; percentage from real load events; first-visit cookie gate; full content for crawlers/no-JS.
5. **"SEO 100"** (Lighthouse cap) as the acceptance number.
6. **usage_count** = view/computed, not stored.
7. **Public reads** = through predicate-baked Postgres views.
8. **Slug uniqueness** = partial unique index `WHERE deleted_at IS NULL`.
9. **Rate limiting** = Postgres-backed (serverless-safe).
10. **CSRF** = Server Actions + `allowedOrigins`; explicit handling for any mutating Route Handler.
11. **next/image** = custom Cloudinary loader.
12. **Referenced-media trashing** blocked; permanent delete purges Cloudinary.
