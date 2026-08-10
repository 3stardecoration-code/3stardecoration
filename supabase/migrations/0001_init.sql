-- 3 Star Decoration — production schema.
-- Run this once in Supabase Dashboard → SQL Editor (or `supabase db push`).
-- Mirrors src/lib/domain/*.ts exactly — keep both in sync if either changes.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('cloudinary_image', 'cloudinary_video', 'youtube', 'vimeo')),
  public_id text,
  provider_id text,
  secure_url text not null,
  thumbnail_url text,
  width int,
  height int,
  duration numeric,
  format text,
  file_size int,
  alt_text text,
  title text,
  caption text,
  tags text[] not null default '{}',
  dominant_color text,
  blur_placeholder text,
  favorite boolean not null default false,
  uploaded_by uuid references auth.users (id) on delete set null,
  uploaded_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  cover_media_asset_id uuid references media_assets (id) on delete set null
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid not null references categories (id),
  event_type text,
  summary text,
  description text,
  cover_media_asset_id uuid references media_assets (id) on delete set null,
  client_name text,
  location text,
  event_date date,
  completion_date date,
  project_status text not null default 'upcoming' check (project_status in ('upcoming', 'ongoing', 'completed')),
  featured_on_homepage boolean not null default false,
  sort_order int not null default 0,
  workflow_status text not null default 'draft' check (workflow_status in ('draft', 'published', 'unpublished')),
  published_at timestamptz,
  meta_title text,
  meta_description text,
  og_media_asset_id uuid references media_assets (id) on delete set null,
  auto_seo_generated boolean not null default false,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  deleted_at timestamptz
);

create table project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  media_asset_id uuid not null references media_assets (id) on delete cascade,
  caption text,
  sort_order int not null default 0
);

create table galleries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid references categories (id) on delete set null,
  type text not null default 'standard' check (type in ('standard', 'homepage_featured', 'instagram')),
  is_active boolean not null default true,
  sort_order int not null default 0,
  deleted_at timestamptz
);

create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references galleries (id) on delete cascade,
  media_asset_id uuid not null references media_assets (id) on delete cascade,
  caption text,
  sort_order int not null default 0
);

create table services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  icon text,
  media_asset_id uuid references media_assets (id) on delete set null,
  sort_order int not null default 0,
  workflow_status text not null default 'draft' check (workflow_status in ('draft', 'published', 'unpublished')),
  published_at timestamptz,
  meta_title text,
  meta_description text,
  og_media_asset_id uuid references media_assets (id) on delete set null,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  deleted_at timestamptz
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  event_type text,
  quote text not null,
  rating int check (rating between 1 and 5),
  media_asset_id uuid references media_assets (id) on delete set null,
  sort_order int not null default 0,
  workflow_status text not null default 'draft' check (workflow_status in ('draft', 'published', 'unpublished')),
  published_at timestamptz,
  deleted_at timestamptz
);

create table hero_banners (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid references media_assets (id) on delete set null,
  eyebrow text,
  title text,
  subtitle text,
  cta_label text,
  cta_href text,
  layout_type text not null default 'fullscreen_image' check (layout_type in ('fullscreen_video', 'fullscreen_image', 'split', 'carousel')),
  sort_order int not null default 0,
  workflow_status text not null default 'draft' check (workflow_status in ('draft', 'published', 'unpublished')),
  published_at timestamptz
);

create table homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  is_enabled boolean not null default true,
  sort_order int not null default 0,
  is_featured boolean not null default false,
  config jsonb not null default '{}'::jsonb
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  event_type text,
  event_date date,
  event_city text,
  venue text,
  guest_count int,
  budget_range text,
  preferred_contact_time text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  assigned_to uuid references auth.users (id) on delete set null,
  notes text,
  source text not null check (source in ('quote_form', 'contact_form')),
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Singleton row (id is always 1) — one settings record for the whole site.
create table site_settings (
  id int primary key default 1,
  business_phone text,
  whatsapp_number text,
  whatsapp_message_template text,
  business_email text,
  address text,
  google_map_embed text,
  social_links jsonb not null default '{}'::jsonb,
  homepage_content jsonb not null default '{}'::jsonb,
  ga4_measurement_id text,
  gsc_verification_token text,
  canonical_base_url text,
  site_name text,
  default_meta_title text,
  default_meta_description text,
  default_og_media_asset_id uuid references media_assets (id) on delete set null,
  constraint site_settings_singleton check (id = 1)
);

create table seo_meta (
  route_key text primary key,
  meta_title text,
  meta_description text,
  og_media_asset_id uuid references media_assets (id) on delete set null,
  canonical text,
  robots_index boolean not null default true,
  robots_follow boolean not null default true
);

create table legal_pages (
  slug text primary key,
  title text not null,
  body text,
  updated_at timestamptz not null default now()
);

-- One row per admin login (Supabase Auth user). Never exposed to anon/public.
create table admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_media_asset_id uuid references media_assets (id) on delete set null,
  role text not null default 'owner' check (role in ('owner', 'admin'))
);

create index projects_category_id_idx on projects (category_id);
create index project_media_project_id_idx on project_media (project_id);
create index gallery_items_gallery_id_idx on gallery_items (gallery_id);
create index enquiries_status_idx on enquiries (status);
create index enquiries_created_at_idx on enquiries (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Public (anon) reads are restricted below to published/active/non-deleted
-- rows only. There are NO public write policies anywhere except enquiry
-- submission (the public quote/contact forms). Every admin write goes
-- through the app's service-role client — the app's own requireAdmin()
-- check (a real Supabase Auth session) is what gates that, not RLS, so the
-- service role intentionally bypasses these policies for admin operations.
-- ---------------------------------------------------------------------------

alter table media_assets enable row level security;
alter table categories enable row level security;
alter table projects enable row level security;
alter table project_media enable row level security;
alter table galleries enable row level security;
alter table gallery_items enable row level security;
alter table services enable row level security;
alter table testimonials enable row level security;
alter table hero_banners enable row level security;
alter table homepage_sections enable row level security;
alter table enquiries enable row level security;
alter table site_settings enable row level security;
alter table seo_meta enable row level security;
alter table legal_pages enable row level security;
alter table admin_profiles enable row level security;

create policy "public read media_assets" on media_assets for select using (deleted_at is null);
create policy "public read categories" on categories for select using (true);
create policy "public read published projects" on projects for select using (workflow_status = 'published' and deleted_at is null);
create policy "public read project_media of published projects" on project_media for select using (
  exists (select 1 from projects p where p.id = project_media.project_id and p.workflow_status = 'published' and p.deleted_at is null)
);
create policy "public read active galleries" on galleries for select using (is_active and deleted_at is null);
create policy "public read items of active galleries" on gallery_items for select using (
  exists (select 1 from galleries g where g.id = gallery_items.gallery_id and g.is_active and g.deleted_at is null)
);
create policy "public read published services" on services for select using (workflow_status = 'published' and deleted_at is null);
create policy "public read published testimonials" on testimonials for select using (workflow_status = 'published' and deleted_at is null);
create policy "public read published hero_banners" on hero_banners for select using (workflow_status = 'published');
create policy "public read enabled homepage_sections" on homepage_sections for select using (is_enabled);
create policy "public read site_settings" on site_settings for select using (true);
create policy "public read seo_meta" on seo_meta for select using (true);
create policy "public read legal_pages" on legal_pages for select using (true);

-- Public quote/contact forms may INSERT an enquiry, never read/update/delete.
create policy "public can submit an enquiry" on enquiries for insert with check (true);

-- admin_profiles: no anon/authenticated policies at all — service-role only.
