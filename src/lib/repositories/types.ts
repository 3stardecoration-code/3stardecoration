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
  EnquiryStatus,
  SiteSettings,
  SeoMeta,
  LegalPage,
  WorkflowStatus,
  ProjectStatus,
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

export interface AdminListProjectsArgs {
  /** Omit for "all non-deleted". */
  status?: WorkflowStatus;
  category_slug?: string;
  search?: string;
}

export interface ProjectPatch {
  title?: string;
  slug?: string;
  category_id?: string;
  event_type?: string | null;
  summary?: string | null;
  description?: string | null;
  cover_media_asset_id?: string | null;
  og_media_asset_id?: string | null;
  client_name?: string | null;
  location?: string | null;
  event_date?: string | null;
  completion_date?: string | null;
  project_status?: ProjectStatus;
  featured_on_homepage?: boolean;
  workflow_status?: WorkflowStatus;
  robots_index?: boolean;
  robots_follow?: boolean;
}

export interface SortOrderEntry {
  id: string;
  sort_order: number;
}

export interface ProjectRepository {
  listPublished(args?: ListProjectsArgs): Promise<Paginated<Project>>;
  listFeatured(): Promise<Project[]>;
  getBySlug(slug: string): Promise<ProjectWithMedia | null>;
  listPublishedSlugs(): Promise<string[]>;
  // --- admin (write) ---
  listForAdmin(args?: AdminListProjectsArgs): Promise<Project[]>;
  listTrash(): Promise<Project[]>;
  getById(id: string): Promise<ProjectWithMedia | null>;
  create(input: { title: string; category_id: string }): Promise<Project>;
  update(id: string, patch: ProjectPatch): Promise<Project>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  reorder(order: SortOrderEntry[]): Promise<void>;
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

export interface ServicePatch {
  title?: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  icon?: string | null;
  media_asset_id?: string | null;
  workflow_status?: WorkflowStatus;
  robots_index?: boolean;
  robots_follow?: boolean;
}

export interface ServiceRepository {
  listPublished(): Promise<Service[]>;
  getBySlug(slug: string): Promise<Service | null>;
  // --- admin (write) ---
  listForAdmin(): Promise<Service[]>;
  listTrash(): Promise<Service[]>;
  getById(id: string): Promise<Service | null>;
  update(id: string, patch: ServicePatch): Promise<Service>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  reorder(order: SortOrderEntry[]): Promise<void>;
}

export interface TestimonialPatch {
  author_name?: string;
  event_type?: string | null;
  quote?: string;
  rating?: number | null;
  media_asset_id?: string | null;
  workflow_status?: WorkflowStatus;
}

export interface TestimonialRepository {
  listPublished(): Promise<Testimonial[]>;
  // --- admin (write) ---
  listForAdmin(): Promise<Testimonial[]>;
  listTrash(): Promise<Testimonial[]>;
  getById(id: string): Promise<Testimonial | null>;
  create(input: { author_name: string; quote: string }): Promise<Testimonial>;
  update(id: string, patch: TestimonialPatch): Promise<Testimonial>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}

export interface HeroRepository {
  listPublished(): Promise<HeroBanner[]>;
}

export interface HomepageRepository {
  listEnabledSections(): Promise<HomepageSection[]>;
}

export interface MediaListArgs {
  search?: string;
  type?: "image" | "video";
  favoriteOnly?: boolean;
  sort?: "latest" | "oldest";
}

export interface NewMediaAsset {
  secure_url: string;
  alt_text: string;
  title?: string | null;
}

export interface MediaRepository {
  getById(id: string): Promise<MediaAsset | null>;
  getManyByIds(ids: string[]): Promise<Record<string, MediaAsset>>;
  // --- admin (write) ---
  listForAdmin(args?: MediaListArgs): Promise<MediaAsset[]>;
  listTrash(): Promise<MediaAsset[]>;
  create(input: NewMediaAsset): Promise<MediaAsset>;
  updateAltText(id: string, alt_text: string): Promise<MediaAsset>;
  toggleFavorite(id: string): Promise<MediaAsset>;
  /** Rejected (throws) if the asset is still referenced anywhere (usage_count > 0). */
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}

export interface EnquiryRepository {
  create(input: NewEnquiry): Promise<Enquiry>;
  list(args?: { limit?: number; status?: EnquiryStatus }): Promise<{ data: Enquiry[] }>;
  getById(id: string): Promise<Enquiry | null>;
  update(id: string, patch: { status?: EnquiryStatus; notes?: string | null }): Promise<Enquiry>;
}

export interface SettingsRepository {
  get(): Promise<SiteSettings>;
  getSeoForRoute(routeKey: string): Promise<SeoMeta | null>;
  update(patch: Partial<SiteSettings>): Promise<SiteSettings>;
}

export interface LegalRepository {
  getBySlug(slug: string): Promise<LegalPage | null>;
}
