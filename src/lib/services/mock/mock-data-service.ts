import "server-only";
import type {
  DataService,
  Paginated,
  ListProjectsArgs,
  ProjectWithMedia,
  GalleryWithItems,
  AdminListProjectsArgs,
  ProjectPatch,
  ServicePatch,
  TestimonialPatch,
  MediaListArgs,
  NewMediaAsset,
  SortOrderEntry,
} from "@/lib/repositories";
import type { Enquiry, MediaAsset, NewEnquiry, Project, Service, Testimonial } from "@/lib/domain";
import * as fx from "./fixtures";

const DEFAULT_PAGE_SIZE = 9;

function paginate<T>(all: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): Paginated<T> {
  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);
  return { items, page, page_size: pageSize, total: all.length, has_more: page * pageSize < all.length };
}

function nowIso(): string {
  return new Date().toISOString();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Mirrors the spec §4.16 media_usage view: counts every reference to a media asset. */
function computeUsageCount(mediaId: string): number {
  let count = 0;
  count += fx.projectMedia.filter((m) => m.media_asset_id === mediaId).length;
  count += fx.galleryItems.filter((i) => i.media_asset_id === mediaId).length;
  count += fx.heroBanners.filter((h) => h.media_asset_id === mediaId).length;
  count += fx.projects.filter(
    (p) => p.cover_media_asset_id === mediaId || p.og_media_asset_id === mediaId,
  ).length;
  count += fx.services.filter(
    (s) => s.media_asset_id === mediaId || s.og_media_asset_id === mediaId,
  ).length;
  count += fx.testimonials.filter((t) => t.media_asset_id === mediaId).length;
  count += fx.categories.filter((c) => c.cover_media_asset_id === mediaId).length;
  if (fx.siteSettings.default_og_media_asset_id === mediaId) count += 1;
  count += fx.seoMeta.filter((s) => s.og_media_asset_id === mediaId).length;
  return count;
}

function withUsageCount(asset: MediaAsset): MediaAsset {
  return { ...asset, usage_count: computeUsageCount(asset.id) };
}

// Mutable stores that live only for the process lifetime (mock, in-memory).
const enquiries: Enquiry[] = [];
let siteSettings = { ...fx.siteSettings };

export const mockDataService: DataService = {
  projects: {
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

    // --- admin (write) ---
    async listForAdmin(args: AdminListProjectsArgs = {}) {
      let rows = fx.projects.filter((p) => !p.deleted_at);
      if (args.status) rows = rows.filter((p) => p.workflow_status === args.status);
      if (args.category_slug) {
        const cat = fx.categories.find((c) => c.slug === args.category_slug);
        rows = rows.filter((p) => p.category_id === cat?.id);
      }
      if (args.search) {
        const q = args.search.toLowerCase();
        rows = rows.filter((p) => p.title.toLowerCase().includes(q));
      }
      return [...rows].sort((a, b) => a.sort_order - b.sort_order);
    },
    async listTrash() {
      return fx.projects.filter((p) => p.deleted_at).sort((a, b) => (b.deleted_at ?? "").localeCompare(a.deleted_at ?? ""));
    },
    async getById(id: string): Promise<ProjectWithMedia | null> {
      const project = fx.projects.find((p) => p.id === id);
      if (!project) return null;
      const media = fx.projectMedia
        .filter((m) => m.project_id === project.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      return { project, media };
    },
    async create(input: { title: string; category_id: string }): Promise<Project> {
      const id = `proj-${Date.now()}`;
      let slug = slugify(input.title);
      if (fx.projects.some((p) => p.slug === slug && !p.deleted_at)) slug = `${slug}-${id.slice(-5)}`;
      const project: Project = {
        id,
        title: input.title,
        slug,
        category_id: input.category_id,
        event_type: null,
        summary: null,
        description: null,
        cover_media_asset_id: null,
        client_name: null,
        location: null,
        event_date: null,
        completion_date: null,
        project_status: "upcoming",
        featured_on_homepage: false,
        sort_order: fx.projects.length,
        workflow_status: "draft",
        published_at: null,
        meta_title: null,
        meta_description: null,
        og_media_asset_id: null,
        auto_seo_generated: false,
        robots_index: true,
        robots_follow: true,
        deleted_at: null,
      };
      fx.projects.push(project);
      return project;
    },
    async update(id: string, patch: ProjectPatch): Promise<Project> {
      const project = fx.projects.find((p) => p.id === id);
      if (!project) throw new Error(`Project not found: ${id}`);
      if (patch.slug && fx.projects.some((p) => p.id !== id && p.slug === patch.slug && !p.deleted_at)) {
        throw new Error(`Slug already in use: ${patch.slug}`);
      }
      const wasPublished = project.workflow_status === "published";
      Object.assign(project, patch);
      if (patch.workflow_status === "published" && !wasPublished) {
        project.published_at = nowIso();
      }
      return project;
    },
    async softDelete(id: string): Promise<void> {
      const project = fx.projects.find((p) => p.id === id);
      if (!project) throw new Error(`Project not found: ${id}`);
      project.deleted_at = nowIso();
    },
    async restore(id: string): Promise<void> {
      const project = fx.projects.find((p) => p.id === id);
      if (!project) throw new Error(`Project not found: ${id}`);
      project.deleted_at = null;
    },
    async reorder(order: SortOrderEntry[]): Promise<void> {
      for (const { id, sort_order } of order) {
        const project = fx.projects.find((p) => p.id === id);
        if (project) project.sort_order = sort_order;
      }
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

    // --- admin (write) ---
    async listForAdmin() {
      return fx.services.filter((s) => !s.deleted_at).sort((a, b) => a.sort_order - b.sort_order);
    },
    async listTrash() {
      return fx.services.filter((s) => s.deleted_at).sort((a, b) => (b.deleted_at ?? "").localeCompare(a.deleted_at ?? ""));
    },
    async getById(id: string) {
      return fx.services.find((s) => s.id === id) ?? null;
    },
    async update(id: string, patch: ServicePatch): Promise<Service> {
      const service = fx.services.find((s) => s.id === id);
      if (!service) throw new Error(`Service not found: ${id}`);
      if (patch.slug && fx.services.some((s) => s.id !== id && s.slug === patch.slug && !s.deleted_at)) {
        throw new Error(`Slug already in use: ${patch.slug}`);
      }
      const wasPublished = service.workflow_status === "published";
      Object.assign(service, patch);
      if (patch.workflow_status === "published" && !wasPublished) {
        service.published_at = nowIso();
      }
      return service;
    },
    async softDelete(id: string): Promise<void> {
      const service = fx.services.find((s) => s.id === id);
      if (!service) throw new Error(`Service not found: ${id}`);
      service.deleted_at = nowIso();
    },
    async restore(id: string): Promise<void> {
      const service = fx.services.find((s) => s.id === id);
      if (!service) throw new Error(`Service not found: ${id}`);
      service.deleted_at = null;
    },
    async reorder(order: SortOrderEntry[]): Promise<void> {
      for (const { id, sort_order } of order) {
        const service = fx.services.find((s) => s.id === id);
        if (service) service.sort_order = sort_order;
      }
    },
  },

  testimonials: {
    async listPublished() {
      return fx.testimonials.filter((t) => t.workflow_status === "published" && !t.deleted_at).sort((a, b) => a.sort_order - b.sort_order);
    },

    // --- admin (write) ---
    async listForAdmin() {
      return fx.testimonials.filter((t) => !t.deleted_at).sort((a, b) => a.sort_order - b.sort_order);
    },
    async listTrash() {
      return fx.testimonials.filter((t) => t.deleted_at).sort((a, b) => (b.deleted_at ?? "").localeCompare(a.deleted_at ?? ""));
    },
    async getById(id: string) {
      return fx.testimonials.find((t) => t.id === id) ?? null;
    },
    async create(input: { author_name: string; quote: string }): Promise<Testimonial> {
      const testimonial: Testimonial = {
        id: `tst-${Date.now()}`,
        author_name: input.author_name,
        event_type: null,
        quote: input.quote,
        rating: 5,
        media_asset_id: null,
        sort_order: fx.testimonials.length,
        workflow_status: "draft",
        published_at: null,
        deleted_at: null,
      };
      fx.testimonials.push(testimonial);
      return testimonial;
    },
    async update(id: string, patch: TestimonialPatch): Promise<Testimonial> {
      const testimonial = fx.testimonials.find((t) => t.id === id);
      if (!testimonial) throw new Error(`Testimonial not found: ${id}`);
      const wasPublished = testimonial.workflow_status === "published";
      Object.assign(testimonial, patch);
      if (patch.workflow_status === "published" && !wasPublished) {
        testimonial.published_at = nowIso();
      }
      return testimonial;
    },
    async softDelete(id: string): Promise<void> {
      const testimonial = fx.testimonials.find((t) => t.id === id);
      if (!testimonial) throw new Error(`Testimonial not found: ${id}`);
      testimonial.deleted_at = nowIso();
    },
    async restore(id: string): Promise<void> {
      const testimonial = fx.testimonials.find((t) => t.id === id);
      if (!testimonial) throw new Error(`Testimonial not found: ${id}`);
      testimonial.deleted_at = null;
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
      const asset = fx.mediaAssets.find((m) => m.id === id && !m.deleted_at);
      return asset ? withUsageCount(asset) : null;
    },
    async getManyByIds(ids: string[]) {
      const set = new Set(ids);
      const out: Record<string, MediaAsset> = {};
      for (const m of fx.mediaAssets) if (set.has(m.id) && !m.deleted_at) out[m.id] = withUsageCount(m);
      return out;
    },

    // --- admin (write) ---
    async listForAdmin(args: MediaListArgs = {}) {
      let rows = fx.mediaAssets.filter((m) => !m.deleted_at);
      if (args.search) {
        const q = args.search.toLowerCase();
        rows = rows.filter(
          (m) => (m.alt_text ?? "").toLowerCase().includes(q) || (m.title ?? "").toLowerCase().includes(q),
        );
      }
      if (args.type === "image") rows = rows.filter((m) => m.source === "cloudinary_image");
      if (args.type === "video") rows = rows.filter((m) => m.source !== "cloudinary_image");
      if (args.favoriteOnly) rows = rows.filter((m) => m.favorite);
      rows = [...rows].sort((a, b) =>
        args.sort === "oldest"
          ? a.uploaded_at.localeCompare(b.uploaded_at)
          : b.uploaded_at.localeCompare(a.uploaded_at),
      );
      return rows.map(withUsageCount);
    },
    async listTrash() {
      return fx.mediaAssets
        .filter((m) => m.deleted_at)
        .sort((a, b) => (b.deleted_at ?? "").localeCompare(a.deleted_at ?? ""))
        .map(withUsageCount);
    },
    async create(input: NewMediaAsset): Promise<MediaAsset> {
      const asset: MediaAsset = {
        id: `media-${Date.now()}`,
        source: "cloudinary_image",
        public_id: null,
        provider_id: null,
        secure_url: input.secure_url,
        thumbnail_url: input.secure_url,
        width: null,
        height: null,
        duration: null,
        format: null,
        file_size: null,
        alt_text: input.alt_text,
        title: input.title ?? null,
        caption: null,
        tags: [],
        dominant_color: null,
        blur_placeholder: null,
        favorite: false,
        uploaded_by: null,
        uploaded_at: nowIso(),
        usage_count: 0,
        deleted_at: null,
      };
      fx.mediaAssets.push(asset);
      return asset;
    },
    async updateAltText(id: string, alt_text: string): Promise<MediaAsset> {
      const asset = fx.mediaAssets.find((m) => m.id === id);
      if (!asset) throw new Error(`Media asset not found: ${id}`);
      asset.alt_text = alt_text;
      return withUsageCount(asset);
    },
    async toggleFavorite(id: string): Promise<MediaAsset> {
      const asset = fx.mediaAssets.find((m) => m.id === id);
      if (!asset) throw new Error(`Media asset not found: ${id}`);
      asset.favorite = !asset.favorite;
      return withUsageCount(asset);
    },
    async softDelete(id: string): Promise<void> {
      const asset = fx.mediaAssets.find((m) => m.id === id);
      if (!asset) throw new Error(`Media asset not found: ${id}`);
      const usage = computeUsageCount(id);
      if (usage > 0) {
        throw new Error(
          `Cannot trash this asset — it is used in ${usage} place${usage === 1 ? "" : "s"}. Remove those references first.`,
        );
      }
      asset.deleted_at = nowIso();
    },
    async restore(id: string): Promise<void> {
      const asset = fx.mediaAssets.find((m) => m.id === id);
      if (!asset) throw new Error(`Media asset not found: ${id}`);
      asset.deleted_at = null;
    },
  },

  enquiries: {
    // TODO(supabase): replace with a Server Action inserting into the `enquiries` table (service role).
    async create(input: NewEnquiry): Promise<Enquiry> {
      const now = nowIso();
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
    async list(args?: { limit?: number; status?: Enquiry["status"] }) {
      let data = [...enquiries].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      if (args?.status) data = data.filter((e) => e.status === args.status);
      if (args?.limit) data = data.slice(0, args.limit);
      return { data };
    },
    async getById(id: string) {
      return enquiries.find((e) => e.id === id) ?? null;
    },
    async update(id: string, patch: { status?: Enquiry["status"]; notes?: string | null }): Promise<Enquiry> {
      const enquiry = enquiries.find((e) => e.id === id);
      if (!enquiry) throw new Error(`Enquiry not found: ${id}`);
      Object.assign(enquiry, patch);
      return enquiry;
    },
  },

  settings: {
    async get() {
      return siteSettings;
    },
    async getSeoForRoute(routeKey) {
      return fx.seoMeta.find((s) => s.route_key === routeKey) ?? null;
    },
    async update(patch) {
      siteSettings = { ...siteSettings, ...patch };
      return siteSettings;
    },
  },

  legal: {
    async getBySlug(slug) {
      return fx.legalPages.find((p) => p.slug === slug) ?? null;
    },
  },
};
