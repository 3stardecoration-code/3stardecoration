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
  AboutRepository,
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
  about: AboutRepository;
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
  /** Re-verifies currentPassword before setting newPassword. Caller must already be an authenticated admin. */
  changePassword(currentPassword: string, newPassword: string): Promise<{ ok: true } | { ok: false; error: string }>;
}
