export interface SiteSettings {
  business_phone: string | null;
  whatsapp_number: string | null;
  whatsapp_message_template: string | null;
  business_email: string | null;
  address: string | null;
  google_map_embed: string | null;
  social_links: Record<string, string>;
  homepage_content: Record<string, unknown>;
  ga4_measurement_id: string | null;
  gsc_verification_token: string | null;
  canonical_base_url: string | null;
  site_name: string | null;
  default_meta_title: string | null;
  default_meta_description: string | null;
  default_og_media_asset_id: string | null;
}

export interface SeoMeta {
  route_key: string;
  meta_title: string | null;
  meta_description: string | null;
  og_media_asset_id: string | null;
  canonical: string | null;
  robots_index: boolean;
  robots_follow: boolean;
}

export interface LegalPage {
  slug: string;
  title: string;
  body: string | null;
  updated_at: string;
}
