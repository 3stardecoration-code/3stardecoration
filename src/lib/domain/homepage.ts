export interface HomepageSection {
  id: string;
  section_key: string;
  is_enabled: boolean;
  sort_order: number;
  is_featured: boolean;
  config: Record<string, unknown>;
}
