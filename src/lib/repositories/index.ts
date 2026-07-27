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
