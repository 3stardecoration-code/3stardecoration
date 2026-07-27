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
