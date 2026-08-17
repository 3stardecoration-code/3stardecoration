import "server-only";
import type { DataService } from "@/lib/repositories";
import { projectRepository } from "./repositories/projects";
import { categoryRepository } from "./repositories/categories";
import { galleryRepository } from "./repositories/galleries";
import { serviceRepository } from "./repositories/services";
import { testimonialRepository } from "./repositories/testimonials";
import { heroRepository } from "./repositories/hero";
import { homepageRepository } from "./repositories/homepage";
import { mediaRepository } from "./repositories/media";
import { enquiryRepository } from "./repositories/enquiries";
import { settingsRepository } from "./repositories/settings";
import { legalRepository } from "./repositories/legal";
import { aboutRepository } from "./repositories/about";

export const supabaseDataService: DataService = {
  projects: projectRepository,
  categories: categoryRepository,
  galleries: galleryRepository,
  services: serviceRepository,
  testimonials: testimonialRepository,
  hero: heroRepository,
  homepage: homepageRepository,
  media: mediaRepository,
  enquiries: enquiryRepository,
  settings: settingsRepository,
  legal: legalRepository,
  about: aboutRepository,
};
