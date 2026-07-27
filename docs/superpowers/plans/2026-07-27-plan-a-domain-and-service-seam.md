# Plan A — Domain Model & Service Seam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the typed domain model and the repository/service seam — with a fully working mock adapter and volume fixtures — so the entire public site and admin UI can be built and run now, and the real Supabase implementation drops in later behind the same interfaces without changing a single UI file.

**Architecture:** Domain types mirror the spec §4 database schema in **snake_case** (see Global Constraints for why). Each data concern is a **repository interface** whose methods are shaped like the exact queries pages need (not generic CRUD). A `DataService` aggregates the repositories; an `AuthService` covers admin sign-in/session. Today these resolve to a **mock adapter** backed by in-memory fixtures; later a Supabase adapter implements the same interfaces. UI code depends only on the interfaces via a single accessor, never on any adapter.

**Tech Stack:** TypeScript · zod (already installed) · Vitest (already installed). No new runtime dependencies.

## Global Constraints

- **Spec of record:** `docs/superpowers/specs/2026-07-27-3-star-decoration-design.md` (v1.1). Domain field names come from spec §4 and §18 **verbatim** — `workflow_status`, `project_status`, `featured_on_homepage`, `cover_media_asset_id`, `og_media_asset_id`, `robots_index`, `robots_follow`, `media_asset_id`, `blur_placeholder`, `dominant_color`, `usage_count`, `layout_type`, `section_key`, etc. **The spec wins.** If a name here disagrees with §4, §4 is correct — fix it here.
- **Domain types are snake_case.** Supabase/PostgREST returns snake_case columns; the spec defines columns in snake_case. Using snake_case domain types means the future Supabase adapter maps rows to domain objects with **zero renaming**, and no UI field access changes when we swap. This is a deliberate, one-time decision: do not introduce camelCase domain fields or a mapping layer. (Local React component-only variables may be camelCase; persisted/domain shapes are snake_case.)
- **Every repository/service method is `async`** and returns a `Promise`, even though the mock resolves synchronously. One sync signature forces a rewrite of every call site at swap time.
- **Methods are query-shaped, not generic CRUD.** e.g. `listPublishedProjects({ page, pageSize, categorySlug? })`, `getPublishedProjectBySlug(slug)`, `listFeaturedProjects()`. No `getAll()` + filter-in-component. This is what maps cleanly onto RLS + the spec §8.5 `?page=N` Load-More.
- **Repositories & services are server-only.** Every adapter/repository/service module starts with `import "server-only";`. Server Components call read methods directly; **Server Actions** perform writes (Plan C). Do **not** build a parallel `/api/*` REST layer — in App Router the Server Action is the write API. Route Handlers only for genuinely external callers (e.g. the existing `/api/health`).
- **UI imports the seam through ONE accessor:** `getDataService()` / `getAuthService()` from `@/lib/services`. UI never imports `mock/` or (later) `supabase/` directly. Swapping adapters is a change to that accessor only.
- **Package manager:** npm only. **Node:** ≥ 20.19. **Commit** after every task with a Conventional Commit message.
- **TDD:** write the failing test first for every task with logic. Run it red, implement, run it green, commit.
- **Repo root:** `/Users/allwin1906/Documents/GitHub/3stardecoration` — the shell resets cwd between calls, so every command `cd`s there first. Current branch: `phase-0-foundation`.
- **No real backend yet.** Where Supabase/Cloudinary/auth would be called, the mock adapter stands in. Mark every seam that a real adapter must later implement with a `// TODO(supabase):` comment naming what connects there.

---

## File Structure (created by this plan)

```
src/lib/
├── domain/
│   ├── enums.ts              # zod enums + inferred union types (spec §4 enums)
│   ├── media.ts              # MediaAsset, MediaSource
│   ├── taxonomy.ts           # Category
│   ├── project.ts            # Project, ProjectMedia, ProjectStatus
│   ├── gallery.ts            # Gallery, GalleryItem, GalleryType
│   ├── content.ts            # HeroBanner, Service, Testimonial
│   ├── homepage.ts           # HomepageSection
│   ├── enquiry.ts            # Enquiry, NewEnquiry, EnquiryStatus
│   ├── settings.ts           # SiteSettings, SeoMeta, LegalPage
│   ├── admin.ts              # AdminProfile, AdminSession
│   └── index.ts              # barrel re-export of all domain types
├── repositories/
│   ├── types.ts              # all repository interfaces + Paginated<T> + query arg types
│   └── index.ts              # DataService interface + AuthService interface
├── services/
│   ├── mock/
│   │   ├── fixtures.ts       # in-memory seed data (volume: 12-18 projects, etc.)
│   │   ├── mock-data-service.ts   # MockDataService implements DataService
│   │   └── mock-auth-service.ts   # MockAuthService implements AuthService
│   ├── provider.ts           # getDataService()/getAuthService() accessor (mock today)
│   └── index.ts              # public barrel: re-exports the accessor + interfaces
tests/
├── domain/enums.test.ts
├── services/mock-data-service.test.ts
├── services/mock-auth-service.test.ts
└── services/pagination.test.ts
docs/
└── architecture-service-seam.md   # how the seam works + how to add the Supabase adapter
```

---

## Task 1: Domain enums

**Files:**
- Create: `src/lib/domain/enums.ts`, `tests/domain/enums.test.ts`

**Interfaces:**
- Produces: zod enum schemas and inferred types for every spec §4 enum:
  `mediaSourceSchema`/`MediaSource`, `workflowStatusSchema`/`WorkflowStatus`,
  `projectStatusSchema`/`ProjectStatus`, `heroLayoutSchema`/`HeroLayout`,
  `enquiryStatusSchema`/`EnquiryStatus`, `enquirySourceSchema`/`EnquirySource`,
  `galleryTypeSchema`/`GalleryType`, `adminRoleSchema`/`AdminRole`.

- [ ] **Step 1: Write the failing test `tests/domain/enums.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import {
  workflowStatusSchema,
  projectStatusSchema,
  heroLayoutSchema,
  mediaSourceSchema,
} from "@/lib/domain/enums";

describe("domain enums", () => {
  it("workflow_status has draft/published/unpublished", () => {
    expect(workflowStatusSchema.options).toEqual(["draft", "published", "unpublished"]);
  });
  it("project_status has upcoming/ongoing/completed", () => {
    expect(projectStatusSchema.options).toEqual(["upcoming", "ongoing", "completed"]);
  });
  it("hero layout has the four variants", () => {
    expect(heroLayoutSchema.options).toEqual([
      "fullscreen_video",
      "fullscreen_image",
      "split",
      "carousel",
    ]);
  });
  it("media source has cloudinary + external providers", () => {
    expect(mediaSourceSchema.options).toEqual([
      "cloudinary_image",
      "cloudinary_video",
      "youtube",
      "vimeo",
    ]);
  });
});
```

- [ ] **Step 2: Run — expect FAIL** (`Cannot find module '@/lib/domain/enums'`)

Run: `cd /Users/allwin1906/Documents/GitHub/3stardecoration && npx vitest run tests/domain/enums.test.ts`

- [ ] **Step 3: Implement `src/lib/domain/enums.ts`**

```ts
import { z } from "zod";

export const mediaSourceSchema = z.enum([
  "cloudinary_image",
  "cloudinary_video",
  "youtube",
  "vimeo",
]);
export type MediaSource = z.infer<typeof mediaSourceSchema>;

export const workflowStatusSchema = z.enum(["draft", "published", "unpublished"]);
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;

export const projectStatusSchema = z.enum(["upcoming", "ongoing", "completed"]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const heroLayoutSchema = z.enum([
  "fullscreen_video",
  "fullscreen_image",
  "split",
  "carousel",
]);
export type HeroLayout = z.infer<typeof heroLayoutSchema>;

export const enquiryStatusSchema = z.enum(["new", "contacted", "closed"]);
export type EnquiryStatus = z.infer<typeof enquiryStatusSchema>;

export const enquirySourceSchema = z.enum(["quote_form", "contact_form"]);
export type EnquirySource = z.infer<typeof enquirySourceSchema>;

export const galleryTypeSchema = z.enum(["standard", "homepage_featured", "instagram"]);
export type GalleryType = z.infer<typeof galleryTypeSchema>;

export const adminRoleSchema = z.enum(["owner", "admin"]);
export type AdminRole = z.infer<typeof adminRoleSchema>;
```

- [ ] **Step 4: Run — expect PASS**

Run: `cd /Users/allwin1906/Documents/GitHub/3stardecoration && npx vitest run tests/domain/enums.test.ts`

- [ ] **Step 5: Commit**

```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration
git add src/lib/domain/enums.ts tests/domain/enums.test.ts
git commit -m "feat(domain): spec §4 enums as zod schemas + inferred types"
```

---

## Task 2: Domain entity types

**Files:**
- Create: `src/lib/domain/media.ts`, `taxonomy.ts`, `project.ts`, `gallery.ts`, `content.ts`, `homepage.ts`, `enquiry.ts`, `settings.ts`, `admin.ts`, `index.ts`

**Interfaces:**
- Consumes: enums from Task 1.
- Produces: TypeScript interfaces (snake_case) for every spec §4 entity, re-exported from `@/lib/domain`. Key exported names later tasks rely on: `MediaAsset`, `Category`, `Project`, `ProjectMedia`, `Gallery`, `GalleryItem`, `HeroBanner`, `Service`, `Testimonial`, `HomepageSection`, `Enquiry`, `NewEnquiry`, `SiteSettings`, `SeoMeta`, `LegalPage`, `AdminProfile`, `AdminSession`.

> These are plain `interface`s (compile-time only), not zod schemas — the mock builds them directly and the future Supabase adapter maps rows to them. `NewEnquiry` is the write-shape for a customer submission (no id/status/timestamps).

- [ ] **Step 1: Write `src/lib/domain/media.ts`**

```ts
import type { MediaSource } from "./enums";

export interface MediaAsset {
  id: string;
  source: MediaSource;
  public_id: string | null;
  provider_id: string | null;
  secure_url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  format: string | null;
  file_size: number | null;
  alt_text: string | null;
  title: string | null;
  caption: string | null;
  tags: string[];
  dominant_color: string | null;
  blur_placeholder: string | null;
  favorite: boolean;
  uploaded_by: string | null;
  uploaded_at: string;
  usage_count: number;
  deleted_at: string | null;
}
```

- [ ] **Step 2: Write `src/lib/domain/taxonomy.ts`**

```ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  cover_media_asset_id: string | null;
}
```

- [ ] **Step 3: Write `src/lib/domain/project.ts`**

```ts
import type { ProjectStatus, WorkflowStatus } from "./enums";

export interface Project {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  event_type: string | null;
  summary: string | null;
  description: string | null;
  cover_media_asset_id: string | null;
  client_name: string | null;
  location: string | null;
  event_date: string | null;
  completion_date: string | null;
  project_status: ProjectStatus;
  featured_on_homepage: boolean;
  sort_order: number;
  workflow_status: WorkflowStatus;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_media_asset_id: string | null;
  auto_seo_generated: boolean;
  robots_index: boolean;
  robots_follow: boolean;
  deleted_at: string | null;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  media_asset_id: string;
  caption: string | null;
  sort_order: number;
}
```

- [ ] **Step 4: Write `src/lib/domain/gallery.ts`**

```ts
import type { GalleryType } from "./enums";

export interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  type: GalleryType;
  is_active: boolean;
  sort_order: number;
  deleted_at: string | null;
}

export interface GalleryItem {
  id: string;
  gallery_id: string;
  media_asset_id: string;
  caption: string | null;
  sort_order: number;
}
```

- [ ] **Step 5: Write `src/lib/domain/content.ts`**

```ts
import type { HeroLayout, WorkflowStatus } from "./enums";

export interface HeroBanner {
  id: string;
  media_asset_id: string | null;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  layout_type: HeroLayout;
  sort_order: number;
  workflow_status: WorkflowStatus;
  published_at: string | null;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  icon: string | null;
  media_asset_id: string | null;
  sort_order: number;
  workflow_status: WorkflowStatus;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_media_asset_id: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  deleted_at: string | null;
}

export interface Testimonial {
  id: string;
  author_name: string;
  event_type: string | null;
  quote: string;
  rating: number | null;
  media_asset_id: string | null;
  sort_order: number;
  workflow_status: WorkflowStatus;
  published_at: string | null;
  deleted_at: string | null;
}
```

- [ ] **Step 6: Write `src/lib/domain/homepage.ts`**

```ts
export interface HomepageSection {
  id: string;
  section_key: string;
  is_enabled: boolean;
  sort_order: number;
  is_featured: boolean;
  config: Record<string, unknown>;
}
```

- [ ] **Step 7: Write `src/lib/domain/enquiry.ts`**

```ts
import type { EnquiryStatus, EnquirySource } from "./enums";

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_type: string | null;
  event_date: string | null;
  event_city: string | null;
  venue: string | null;
  guest_count: number | null;
  budget_range: string | null;
  preferred_contact_time: string | null;
  message: string | null;
  status: EnquiryStatus;
  assigned_to: string | null;
  notes: string | null;
  source: EnquirySource;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

// Write-shape for a public submission: no id/status/timestamps/internal fields.
export interface NewEnquiry {
  name: string;
  phone: string;
  email?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  event_city?: string | null;
  venue?: string | null;
  guest_count?: number | null;
  budget_range?: string | null;
  preferred_contact_time?: string | null;
  message?: string | null;
  source: EnquirySource;
}
```

- [ ] **Step 8: Write `src/lib/domain/settings.ts`**

```ts
export interface SiteSettings {
  business_phone: string | null;
  whatsapp_number: string | null;
  whatsapp_message_template: string | null;
  business_email: string | null;
  address: string | null;
  google_map_embed: string | null;
  social_links: Record<string, string>;
  homepage_content: Record<string, unknown>;
  ga4_measurement_id: string | null;
  gsc_verification_token: string | null;
  canonical_base_url: string | null;
  site_name: string | null;
  default_meta_title: string | null;
  default_meta_description: string | null;
  default_og_media_asset_id: string | null;
}

export interface SeoMeta {
  route_key: string;
  meta_title: string | null;
  meta_description: string | null;
  og_media_asset_id: string | null;
  canonical: string | null;
  robots_index: boolean;
  robots_follow: boolean;
}

export interface LegalPage {
  slug: string;
  title: string;
  body: string | null;
  updated_at: string;
}
```

- [ ] **Step 9: Write `src/lib/domain/admin.ts`**

```ts
import type { AdminRole } from "./enums";

export interface AdminProfile {
  user_id: string;
  full_name: string | null;
  avatar_media_asset_id: string | null;
  role: AdminRole;
}

export interface AdminSession {
  user_id: string;
  email: string;
  profile: AdminProfile;
}
```

- [ ] **Step 10: Write the barrel `src/lib/domain/index.ts`**

```ts
export * from "./enums";
export * from "./media";
export * from "./taxonomy";
export * from "./project";
export * from "./gallery";
export * from "./content";
export * from "./homepage";
export * from "./enquiry";
export * from "./settings";
export * from "./admin";
```

- [ ] **Step 11: Typecheck — expect PASS**

Run: `cd /Users/allwin1906/Documents/GitHub/3stardecoration && npm run typecheck`
Expected: no errors.

- [ ] **Step 12: Commit**

```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration
git add src/lib/domain
git commit -m "feat(domain): snake_case entity types mirroring spec §4"
```

---

## Task 3: Repository & service interfaces

**Files:**
- Create: `src/lib/repositories/types.ts`, `src/lib/repositories/index.ts`

**Interfaces:**
- Consumes: all domain types from Task 2.
- Produces:
  - `Paginated<T>` = `{ items: T[]; page: number; page_size: number; total: number; has_more: boolean }`
  - `ListProjectsArgs` = `{ page?: number; page_size?: number; category_slug?: string }`
  - Repository interfaces: `ProjectRepository`, `CategoryRepository`, `GalleryRepository`, `ServiceRepository`, `TestimonialRepository`, `HeroRepository`, `HomepageRepository`, `MediaRepository`, `EnquiryRepository`, `SettingsRepository`, `LegalRepository`.
  - `DataService` interface aggregating the read/write repositories.
  - `AuthService` interface: `getSession()`, `signIn(email, password)`, `signOut()`, `requireAdmin()`.

> Query-shaped methods only. Every method returns a Promise. Public read methods return already-filtered published/active data (the future Supabase adapter enforces this via RLS/views; the mock enforces it in code).

- [ ] **Step 1: Write `src/lib/repositories/types.ts`**

```ts
import type {
  Project,
  ProjectMedia,
  Category,
  Gallery,
  GalleryItem,
  Service,
  Testimonial,
  HeroBanner,
  HomepageSection,
  MediaAsset,
  Enquiry,
  NewEnquiry,
  SiteSettings,
  SeoMeta,
  LegalPage,
} from "@/lib/domain";

export interface Paginated<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface ListProjectsArgs {
  page?: number;
  page_size?: number;
  category_slug?: string;
}

export interface ProjectWithMedia {
  project: Project;
  media: ProjectMedia[];
}

export interface ProjectRepository {
  listPublished(args?: ListProjectsArgs): Promise<Paginated<Project>>;
  listFeatured(): Promise<Project[]>;
  getBySlug(slug: string): Promise<ProjectWithMedia | null>;
  listPublishedSlugs(): Promise<string[]>;
}

export interface CategoryRepository {
  list(): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
}

export interface GalleryWithItems {
  gallery: Gallery;
  items: GalleryItem[];
}

export interface GalleryRepository {
  listActive(): Promise<Gallery[]>;
  getBySlug(slug: string): Promise<GalleryWithItems | null>;
}

export interface ServiceRepository {
  listPublished(): Promise<Service[]>;
  getBySlug(slug: string): Promise<Service | null>;
}

export interface TestimonialRepository {
  listPublished(): Promise<Testimonial[]>;
}

export interface HeroRepository {
  listPublished(): Promise<HeroBanner[]>;
}

export interface HomepageRepository {
  listEnabledSections(): Promise<HomepageSection[]>;
}

export interface MediaRepository {
  getById(id: string): Promise<MediaAsset | null>;
  getManyByIds(ids: string[]): Promise<Record<string, MediaAsset>>;
}

export interface EnquiryRepository {
  create(input: NewEnquiry): Promise<Enquiry>;
}

export interface SettingsRepository {
  get(): Promise<SiteSettings>;
  getSeoForRoute(routeKey: string): Promise<SeoMeta | null>;
}

export interface LegalRepository {
  getBySlug(slug: string): Promise<LegalPage | null>;
}
```

- [ ] **Step 2: Write `src/lib/repositories/index.ts`**

```ts
import type {
  ProjectRepository,
  CategoryRepository,
  GalleryRepository,
  ServiceRepository,
  TestimonialRepository,
  HeroRepository,
  HomepageRepository,
  MediaRepository,
  EnquiryRepository,
  SettingsRepository,
  LegalRepository,
} from "./types";
import type { AdminSession } from "@/lib/domain";

export * from "./types";

export interface DataService {
  projects: ProjectRepository;
  categories: CategoryRepository;
  galleries: GalleryRepository;
  services: ServiceRepository;
  testimonials: TestimonialRepository;
  hero: HeroRepository;
  homepage: HomepageRepository;
  media: MediaRepository;
  enquiries: EnquiryRepository;
  settings: SettingsRepository;
  legal: LegalRepository;
}

export interface SignInResult {
  ok: boolean;
  error?: string;
  session?: AdminSession;
}

export interface AuthService {
  getSession(): Promise<AdminSession | null>;
  signIn(email: string, password: string): Promise<SignInResult>;
  signOut(): Promise<void>;
  // Throws/redirects if no admin session; returns the session otherwise.
  requireAdmin(): Promise<AdminSession>;
}
```

- [ ] **Step 3: Typecheck — expect PASS**

Run: `cd /Users/allwin1906/Documents/GitHub/3stardecoration && npm run typecheck`

- [ ] **Step 4: Commit**

```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration
git add src/lib/repositories
git commit -m "feat(repositories): query-shaped repository + DataService/AuthService interfaces"
```

---

## Task 4: Mock fixtures (volume seed data)

**Files:**
- Create: `src/lib/services/mock/fixtures.ts`

**Interfaces:**
- Consumes: domain types (Task 2).
- Produces: exported in-memory arrays/objects used by the mock service:
  `categories: Category[]` (7, mirroring `supabase/seed.sql` slugs),
  `mediaAssets: MediaAsset[]`, `projects: Project[]` (**14 published**, spread across all 7 categories, ≥3 `featured_on_homepage`), `projectMedia: ProjectMedia[]` (≥4 per project),
  `galleries: Gallery[]` + `galleryItems: GalleryItem[]` (incl. a `type:"instagram"` and a `type:"homepage_featured"`),
  `services: Service[]` (6 published), `testimonials: Testimonial[]` (5 published),
  `heroBanners: HeroBanner[]` (2 published), `homepageSections: HomepageSection[]` (6, mirroring seed.sql), `siteSettings: SiteSettings`, `seoMeta: SeoMeta[]`, `legalPages: LegalPage[]` (privacy + terms).

> Volume matters: one demo project cannot exercise masonry, category filters, or `?page=N` Load-More. Use **local placeholder image paths** under `/public` (e.g. `/mock/wedding-01.jpg`) so `next/image` + the Cloudinary loader's local-path passthrough render them without a Cloudinary account. Singletons (siteSettings, homepageSections) mirror `supabase/seed.sql` so the later Supabase swap is a no-op.

- [ ] **Step 1: Create placeholder public assets directory + a README**

```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration
mkdir -p public/mock
printf '%s\n' '# Mock media' 'Placeholder images for pre-Supabase development. Replace with real Cloudinary assets when the CMS is connected. Referenced by src/lib/services/mock/fixtures.ts via /mock/*.jpg paths.' > public/mock/README.md
```

- [ ] **Step 2: Write `src/lib/services/mock/fixtures.ts`**

Write a module exporting the fixtures below. Use deterministic string ids (`"proj-01"`, `"cat-wedding"`, `"media-w01"`, …) so tests can assert on them. Provide a small helper to reduce repetition. Full content:

```ts
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
```

- [ ] **Step 3: Typecheck — expect PASS**

Run: `cd /Users/allwin1906/Documents/GitHub/3stardecoration && npm run typecheck`

- [ ] **Step 4: Commit**

```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration
git add src/lib/services/mock/fixtures.ts public/mock/README.md
git commit -m "feat(mock): volume fixtures (14 projects, galleries, services, testimonials)"
```

---

## Task 5: Mock DataService

**Files:**
- Create: `src/lib/services/mock/mock-data-service.ts`, `tests/services/mock-data-service.test.ts`, `tests/services/pagination.test.ts`

**Interfaces:**
- Consumes: `DataService` + repository interfaces (Task 3), fixtures (Task 4).
- Produces: `mockDataService: DataService` (a singleton object literal) whose read methods return only published/active, non-deleted rows, with real pagination on `projects.listPublished`.

> `import "server-only"` at the top. Pagination default `page_size` = 9 (fits a 3-col masonry Load-More). `has_more = page * page_size < total`.

> **Why the setup steps below exist:** the mock service (and every future adapter) starts with `import "server-only"` so it can never be bundled into a Client Component. But the `server-only` package's default export **throws on import** in any non-`react-server` environment — including Vitest — so tests that import this module would crash at import time. Steps 1–3 install `server-only` and alias it to an empty no-op stub *for tests only* (Next's own bundler still gets the real package, preserving the server-only guarantee in the app). Do these before writing the test.

- [ ] **Step 1: Install `server-only`**

```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration && npm i server-only
```

- [ ] **Step 2: Create the test stub `tests/stubs/server-only.ts`**

```ts
// Empty no-op: aliased in place of the real `server-only` package under Vitest,
// whose default export throws when imported outside Next's react-server bundler.
export {};
```

- [ ] **Step 3: Alias `server-only` to the stub in `vitest.config.ts`** (the file currently has this exact content — replace it wholesale)

Current content:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
```

Replace with:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
```

- [ ] **Step 4: Write the failing test `tests/services/pagination.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { mockDataService } from "@/lib/services/mock/mock-data-service";

describe("mockDataService.projects pagination", () => {
  it("paginates published projects with has_more", async () => {
    const p1 = await mockDataService.projects.listPublished({ page: 1, page_size: 9 });
    expect(p1.items).toHaveLength(9);
    expect(p1.total).toBe(14);
    expect(p1.has_more).toBe(true);
    const p2 = await mockDataService.projects.listPublished({ page: 2, page_size: 9 });
    expect(p2.items).toHaveLength(5);
    expect(p2.has_more).toBe(false);
  });

  it("filters by category slug", async () => {
    const res = await mockDataService.projects.listPublished({ category_slug: "wedding", page_size: 50 });
    expect(res.items.length).toBe(2);
    expect(res.items.every((p) => p.category_id === "cat-wedding")).toBe(true);
  });
});
```

- [ ] **Step 5: Write the failing test `tests/services/mock-data-service.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { mockDataService } from "@/lib/services/mock/mock-data-service";

describe("mockDataService reads", () => {
  it("returns only featured projects for the homepage", async () => {
    const featured = await mockDataService.projects.listFeatured();
    expect(featured.length).toBeGreaterThanOrEqual(3);
    expect(featured.every((p) => p.featured_on_homepage)).toBe(true);
  });

  it("gets a project with its ordered media by slug", async () => {
    const res = await mockDataService.projects.getBySlug("ivory-garden-wedding");
    expect(res).not.toBeNull();
    expect(res!.project.title).toBe("Ivory Garden Wedding");
    expect(res!.media.length).toBe(4);
    expect(res!.media.map((m) => m.sort_order)).toEqual([1, 2, 3, 4]);
  });

  it("returns null for an unknown slug", async () => {
    expect(await mockDataService.projects.getBySlug("nope")).toBeNull();
  });

  it("lists 7 categories and the enabled homepage sections", async () => {
    expect(await mockDataService.categories.list()).toHaveLength(7);
    const sections = await mockDataService.homepage.listEnabledSections();
    expect(sections.map((s) => s.section_key)).toContain("hero");
  });

  it("exposes site settings with a whatsapp number", async () => {
    const s = await mockDataService.settings.get();
    expect(s.whatsapp_number).toBeTruthy();
  });

  it("creates an enquiry and assigns id + status new", async () => {
    const e = await mockDataService.enquiries.create({
      name: "Test", phone: "999", source: "quote_form",
    });
    expect(e.id).toBeTruthy();
    expect(e.status).toBe("new");
  });
});
```

- [ ] **Step 6: Run both — expect FAIL** (`Cannot find module '.../mock-data-service'`)

Run: `cd /Users/allwin1906/Documents/GitHub/3stardecoration && npx vitest run tests/services/pagination.test.ts tests/services/mock-data-service.test.ts`

- [ ] **Step 7: Implement `src/lib/services/mock/mock-data-service.ts`**

```ts
import "server-only";
import type { DataService, Paginated, ListProjectsArgs, ProjectWithMedia, GalleryWithItems } from "@/lib/repositories";
import type { Enquiry, MediaAsset, NewEnquiry } from "@/lib/domain";
import * as fx from "./fixtures";

const DEFAULT_PAGE_SIZE = 9;

function paginate<T>(all: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): Paginated<T> {
  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);
  return { items, page, page_size: pageSize, total: all.length, has_more: page * pageSize < all.length };
}

// Mutable copy so create() during dev doesn't mutate the imported fixture array.
const enquiries: Enquiry[] = [];

export const mockDataService: DataService = {
  projects: {
    // Return type is inferred from DataService's ProjectRepository.listPublished (Paginated<Project>).
    async listPublished(args: ListProjectsArgs = {}) {
      let rows = fx.projects.filter((p) => p.workflow_status === "published" && !p.deleted_at);
      if (args.category_slug) {
        const cat = fx.categories.find((c) => c.slug === args.category_slug);
        rows = rows.filter((p) => p.category_id === cat?.id);
      }
      rows = [...rows].sort((a, b) => a.sort_order - b.sort_order);
      return paginate(rows, args.page ?? 1, args.page_size ?? DEFAULT_PAGE_SIZE);
    },
    async listFeatured() {
      return fx.projects
        .filter((p) => p.featured_on_homepage && p.workflow_status === "published" && !p.deleted_at)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    async getBySlug(slug: string): Promise<ProjectWithMedia | null> {
      const project = fx.projects.find((p) => p.slug === slug && p.workflow_status === "published" && !p.deleted_at);
      if (!project) return null;
      const media = fx.projectMedia
        .filter((m) => m.project_id === project.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      return { project, media };
    },
    async listPublishedSlugs() {
      return fx.projects.filter((p) => p.workflow_status === "published" && !p.deleted_at).map((p) => p.slug);
    },
  },

  categories: {
    async list() {
      return [...fx.categories].sort((a, b) => a.sort_order - b.sort_order);
    },
    async getBySlug(slug) {
      return fx.categories.find((c) => c.slug === slug) ?? null;
    },
  },

  galleries: {
    async listActive() {
      return fx.galleries.filter((g) => g.is_active && !g.deleted_at).sort((a, b) => a.sort_order - b.sort_order);
    },
    async getBySlug(slug: string): Promise<GalleryWithItems | null> {
      const gallery = fx.galleries.find((g) => g.slug === slug && g.is_active && !g.deleted_at);
      if (!gallery) return null;
      const items = fx.galleryItems.filter((i) => i.gallery_id === gallery.id).sort((a, b) => a.sort_order - b.sort_order);
      return { gallery, items };
    },
  },

  services: {
    async listPublished() {
      return fx.services.filter((s) => s.workflow_status === "published" && !s.deleted_at).sort((a, b) => a.sort_order - b.sort_order);
    },
    async getBySlug(slug) {
      return fx.services.find((s) => s.slug === slug && s.workflow_status === "published" && !s.deleted_at) ?? null;
    },
  },

  testimonials: {
    async listPublished() {
      return fx.testimonials.filter((t) => t.workflow_status === "published" && !t.deleted_at).sort((a, b) => a.sort_order - b.sort_order);
    },
  },

  hero: {
    async listPublished() {
      return fx.heroBanners.filter((h) => h.workflow_status === "published").sort((a, b) => a.sort_order - b.sort_order);
    },
  },

  homepage: {
    async listEnabledSections() {
      return fx.homepageSections.filter((s) => s.is_enabled).sort((a, b) => a.sort_order - b.sort_order);
    },
  },

  media: {
    async getById(id) {
      return fx.mediaAssets.find((m) => m.id === id && !m.deleted_at) ?? null;
    },
    async getManyByIds(ids: string[]) {
      const set = new Set(ids);
      const out: Record<string, MediaAsset> = {};
      for (const m of fx.mediaAssets) if (set.has(m.id) && !m.deleted_at) out[m.id] = m;
      return out;
    },
  },

  enquiries: {
    // TODO(supabase): replace with a Server Action inserting into the `enquiries` table (service role).
    async create(input: NewEnquiry): Promise<Enquiry> {
      const now = new Date().toISOString();
      const enquiry: Enquiry = {
        id: `enq-${enquiries.length + 1}-${Date.now()}`,
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        event_type: input.event_type ?? null,
        event_date: input.event_date ?? null,
        event_city: input.event_city ?? null,
        venue: input.venue ?? null,
        guest_count: input.guest_count ?? null,
        budget_range: input.budget_range ?? null,
        preferred_contact_time: input.preferred_contact_time ?? null,
        message: input.message ?? null,
        status: "new",
        assigned_to: null,
        notes: null,
        source: input.source,
        ip: null,
        user_agent: null,
        created_at: now,
      };
      enquiries.push(enquiry);
      return enquiry;
    },
  },

  settings: {
    async get() {
      return fx.siteSettings;
    },
    async getSeoForRoute(routeKey) {
      return fx.seoMeta.find((s) => s.route_key === routeKey) ?? null;
    },
  },

  legal: {
    async getBySlug(slug) {
      return fx.legalPages.find((p) => p.slug === slug) ?? null;
    },
  },
};
```

- [ ] **Step 8: Run both tests — expect PASS**

Run: `cd /Users/allwin1906/Documents/GitHub/3stardecoration && npx vitest run tests/services/pagination.test.ts tests/services/mock-data-service.test.ts`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration
git add src/lib/services/mock/mock-data-service.ts tests/services tests/stubs vitest.config.ts package.json package-lock.json
git commit -m "feat(mock): MockDataService implementing DataService over fixtures"
```

---

## Task 6: Mock AuthService + seam accessor

**Files:**
- Create: `src/lib/services/mock/mock-auth-service.ts`, `src/lib/services/provider.ts`, `src/lib/services/index.ts`, `tests/services/mock-auth-service.test.ts`

**Interfaces:**
- Consumes: `AuthService` (Task 3), `DataService` + `mockDataService` (Task 5).
- Produces:
  - `mockAuthService: AuthService` — `signIn` always succeeds (returns a stub owner session), `getSession` returns the stub session, `requireAdmin` returns it.
  - `getDataService(): DataService` and `getAuthService(): AuthService` in `provider.ts` — the single accessor the whole app imports.
  - `@/lib/services` barrel re-exporting the accessor + the interface types.

> This is the seam, not a real auth system. Everything is marked `// TODO(supabase):`. When Supabase arrives, `provider.ts` swaps the two return values to the Supabase adapters and nothing else changes.

- [ ] **Step 1: Write the failing test `tests/services/mock-auth-service.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { mockAuthService } from "@/lib/services/mock/mock-auth-service";

describe("mockAuthService", () => {
  it("signIn always succeeds with a stub owner session", async () => {
    const res = await mockAuthService.signIn("owner@example.com", "whatever");
    expect(res.ok).toBe(true);
    expect(res.session?.profile.role).toBe("owner");
  });
  it("getSession returns the stub session", async () => {
    expect(await mockAuthService.getSession()).not.toBeNull();
  });
  it("requireAdmin returns the session (never throws in mock)", async () => {
    const s = await mockAuthService.requireAdmin();
    expect(s.email).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `cd /Users/allwin1906/Documents/GitHub/3stardecoration && npx vitest run tests/services/mock-auth-service.test.ts`

- [ ] **Step 3: Implement `src/lib/services/mock/mock-auth-service.ts`**

```ts
import "server-only";
import type { AuthService, SignInResult } from "@/lib/repositories";
import type { AdminSession } from "@/lib/domain";

// TODO(supabase): replace the entire stub with Supabase Auth (@supabase/ssr cookie session)
// + admin_profiles lookup + real requireAdmin() that redirects unauthenticated users.
const STUB_SESSION: AdminSession = {
  user_id: "stub-owner",
  email: "owner@3stardecoration.local",
  profile: { user_id: "stub-owner", full_name: "Owner", avatar_media_asset_id: null, role: "owner" },
};

export const mockAuthService: AuthService = {
  async getSession(): Promise<AdminSession | null> {
    // TODO(supabase): read the real cookie session. Mock: always "signed in" for UI dev.
    return STUB_SESSION;
  },
  async signIn(): Promise<SignInResult> {
    // TODO(supabase): verify credentials via Supabase Auth. Mock: always succeeds.
    return { ok: true, session: STUB_SESSION };
  },
  async signOut(): Promise<void> {
    // TODO(supabase): clear the Supabase session cookie. Mock: no-op.
  },
  async requireAdmin(): Promise<AdminSession> {
    // TODO(supabase): redirect('/admin/login') when no admin session. Mock: always returns the stub.
    return STUB_SESSION;
  },
};
```

- [ ] **Step 4: Implement `src/lib/services/provider.ts`**

```ts
import "server-only";
import type { DataService, AuthService } from "@/lib/repositories";
import { mockDataService } from "./mock/mock-data-service";
import { mockAuthService } from "./mock/mock-auth-service";

// Single swap point. When the client's Supabase project exists, change these two
// functions to return the Supabase adapters — no UI file changes required.
// TODO(supabase): return supabaseDataService / supabaseAuthService here.
export function getDataService(): DataService {
  return mockDataService;
}

export function getAuthService(): AuthService {
  return mockAuthService;
}
```

- [ ] **Step 5: Implement the barrel `src/lib/services/index.ts`**

```ts
export type {
  DataService,
  AuthService,
  Paginated,
  ListProjectsArgs,
  ProjectWithMedia,
  GalleryWithItems,
  SignInResult,
} from "@/lib/repositories";
export { getDataService, getAuthService } from "./provider";
```

- [ ] **Step 6: Run the auth test + typecheck — expect PASS**

Run: `cd /Users/allwin1906/Documents/GitHub/3stardecoration && npx vitest run tests/services/mock-auth-service.test.ts && npm run typecheck`

- [ ] **Step 7: Commit**

```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration
git add src/lib/services/mock/mock-auth-service.ts src/lib/services/provider.ts src/lib/services/index.ts tests/services/mock-auth-service.test.ts
git commit -m "feat(services): MockAuthService + getDataService/getAuthService seam accessor"
```

---

## Task 7: Architecture doc + full verification

**Files:**
- Create: `docs/architecture-service-seam.md`
- Modify: `docs/folder-structure.md` (add the new `domain/`, `repositories/`, `services/` dirs)

**Interfaces:**
- Consumes: everything above.
- Produces: documentation of the seam and how to add the Supabase adapter; a green full-suite run.

- [ ] **Step 1: Write `docs/architecture-service-seam.md`**

Document, in prose an engineer can follow: (1) the layering — `domain/` (types) → `repositories/` (interfaces) → `services/` (adapters + accessor) → UI; (2) the rule that UI imports only `getDataService()`/`getAuthService()` from `@/lib/services`; (3) the snake_case decision and why; (4) a step-by-step "Adding the Supabase adapter later" section: create `src/lib/services/supabase/supabase-data-service.ts` + `supabase-auth-service.ts` implementing the same `DataService`/`AuthService` interfaces (mapping PostgREST snake_case rows straight to domain types), then flip the two returns in `provider.ts`; (5) an inventory of every `// TODO(supabase):` marker and what each connects (enquiries.create → Server Action insert; auth methods → Supabase Auth). Reference spec §5 (RLS/views), §10 (enquiry flow), §12 (auth).

- [ ] **Step 2: Update `docs/folder-structure.md`** — add entries for `src/lib/domain/`, `src/lib/repositories/`, `src/lib/services/` (with `mock/`), and `public/mock/`, each with a one-line purpose. Read the current file first and insert the new rows in the existing table/tree without disturbing the rest.

- [ ] **Step 3: Full verification — expect all green**

Run:
```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration
npm run lint && npm run typecheck && npm test && npm run build
```
Expected: lint clean; typecheck clean; all test files pass (enums, mock-data-service, pagination, mock-auth-service, plus the pre-existing 6); build succeeds with placeholder `.env.local`.

- [ ] **Step 4: Commit**

```bash
cd /Users/allwin1906/Documents/GitHub/3stardecoration
git add docs/architecture-service-seam.md docs/folder-structure.md
git commit -m "docs: service-seam architecture + folder-structure update"
```

---

## Plan A Definition of Done

- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all pass.
- [ ] `getDataService()` returns a `DataService` serving 14 published projects across 7 categories, with working pagination (`page_size` 9 → `has_more`) and category filtering.
- [ ] `getAuthService()` returns an `AuthService` whose `signIn` succeeds and `requireAdmin` returns a stub owner session.
- [ ] Every domain field name matches spec §4/§18 verbatim; all domain types are snake_case.
- [ ] Every method on every repository/service is `async`.
- [ ] No UI or Server Action exists yet that imports `mock/` directly (nothing consumes it yet — Plans B/C will, only through `@/lib/services`).
- [ ] Every backend seam carries a `// TODO(supabase):` marker; `docs/architecture-service-seam.md` inventories them.
- [ ] Every task committed with a conventional-commit message.

## Spec Coverage (Plan A slice)

| Spec ref | Covered by |
|---|---|
| §4 entities/enums (domain model) | Tasks 1–2 |
| §4.16 usage_count (as a field the adapter fills) | Task 2 (MediaAsset.usage_count) |
| §4.17 homepage_sections | Tasks 2, 4, 5 |
| §5 published/non-deleted read filtering | Task 5 (mock enforces; Supabase adapter will use RLS/views) |
| §8.5 `?page=N` Load-More pagination shape | Tasks 3, 5 (`Paginated<T>`) |
| §10 enquiry write-shape + WhatsApp (data side) | Tasks 2 (`NewEnquiry`), 5 (`enquiries.create`) |
| §12 admin auth seam | Task 6 (`AuthService`, `requireAdmin`) |
| §18.1 cover image as explicit field | Task 2 (`cover_media_asset_id`) |
| §18.3 hero layout_type | Task 2 (`HeroBanner.layout_type`) |
| §18.7 robots index/follow | Task 2 (project/service/seo fields) |

> Deferred (later plans): public site UI + motion (Plan B); admin dashboard UI + Server Actions (Plan C); the real Supabase adapter (resumes when the client's project exists — swap `provider.ts` only).
