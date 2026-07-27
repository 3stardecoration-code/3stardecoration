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
