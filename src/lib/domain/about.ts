export interface AboutStat {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
}

export interface AboutProcessStep {
  title: string;
  description: string;
}

export interface AboutPageContent {
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  story_eyebrow: string;
  story_title: string;
  story_body: string;
  story_image_asset_id: string | null;
  story_badge_value: string;
  story_badge_label: string;
  values: string[];
  stats_eyebrow: string;
  stats_title: string;
  stats: AboutStat[];
  process_eyebrow: string;
  process_title: string;
  process_description: string;
  process_steps: AboutProcessStep[];
}
