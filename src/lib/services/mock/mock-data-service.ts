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
    async list(args?: { limit?: number }) {
      // Return mock data, newest first
      let data = [...enquiries].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      if (args?.limit) {
        data = data.slice(0, args.limit);
      }
      return { data };
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
