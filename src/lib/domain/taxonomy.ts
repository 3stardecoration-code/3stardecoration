export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  cover_media_asset_id: string | null;
}
