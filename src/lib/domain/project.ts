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
