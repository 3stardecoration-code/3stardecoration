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
  list(args?: { limit?: number }): Promise<{ data: Enquiry[] }>;
}

export interface SettingsRepository {
  get(): Promise<SiteSettings>;
  getSeoForRoute(routeKey: string): Promise<SeoMeta | null>;
}

export interface LegalRepository {
  getBySlug(slug: string): Promise<LegalPage | null>;
}
