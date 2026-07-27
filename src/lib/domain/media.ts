import type { MediaSource } from "./enums";

export interface MediaAsset {
  id: string;
  source: MediaSource;
  public_id: string | null;
  provider_id: string | null;
  secure_url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  format: string | null;
  file_size: number | null;
  alt_text: string | null;
  title: string | null;
  caption: string | null;
  tags: string[];
  dominant_color: string | null;
  blur_placeholder: string | null;
  favorite: boolean;
  uploaded_by: string | null;
  uploaded_at: string;
  usage_count: number;
  deleted_at: string | null;
}
