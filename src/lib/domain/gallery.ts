import type { GalleryType } from "./enums";

export interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  type: GalleryType;
  is_active: boolean;
  sort_order: number;
  deleted_at: string | null;
}

export interface GalleryItem {
  id: string;
  gallery_id: string;
  media_asset_id: string;
  caption: string | null;
  sort_order: number;
}
