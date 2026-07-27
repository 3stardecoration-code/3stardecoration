# Database ER Diagram

> **Status:** This diagram reflects the schema **written and self-reviewed** in
> the Task 7 (`supabase/migrations/0001`–`0004`) and Task 8 (`0005`) sections of
> `docs/superpowers/plans/2026-07-27-phase-0-foundation.md`. Tasks 6–9 are
> **deferred** — the client's hosted Supabase project does not exist yet, so
> these migrations have not been applied to any database and the
> `supabase/migrations/*.sql` files do not exist in this repo yet. This doc will
> be regenerated from the real migration files once Tasks 6–9 resume.

All 17 tables from spec §4, with `media_assets` as the central hub referenced
by nearly every content table (cover images, OG images, avatars, gallery/
project media). Enum types (`media_source`, `workflow_status`,
`project_status`, `hero_layout`, `enquiry_status`, `enquiry_source`,
`gallery_type`, `admin_role`) are noted on the relevant attributes but modeled
as plain types below since Mermaid `erDiagram` has no enum construct.

`auth.users` (Supabase-managed, not one of the 17 app tables) is referenced by
several tables (`media_assets.uploaded_by`/`deleted_by`, `projects.deleted_by`,
`enquiries.assigned_to`, `admin_profiles.user_id`, `audit_logs.actor_user_id`,
`site_settings.updated_by`, `seo_meta.updated_by`, `legal_pages.updated_by`,
`homepage_sections.updated_by`) but is omitted from the diagram to keep it
focused on the app's own schema.

```mermaid
erDiagram
  media_assets {
    uuid id PK
    media_source source
    text secure_url
    text alt_text
    boolean favorite
    timestamptz deleted_at
  }

  categories {
    uuid id PK
    text name
    text slug
    uuid cover_media_asset_id FK
  }

  hero_banners {
    uuid id PK
    uuid media_asset_id FK
    hero_layout layout_type
    workflow_status workflow_status
  }

  projects {
    uuid id PK
    text title
    text slug
    uuid category_id FK
    uuid cover_media_asset_id FK
    uuid og_media_asset_id FK
    project_status project_status
    workflow_status workflow_status
    timestamptz deleted_at
  }

  project_media {
    uuid id PK
    uuid project_id FK
    uuid media_asset_id FK
  }

  galleries {
    uuid id PK
    text title
    text slug
    uuid category_id FK
    gallery_type type
    timestamptz deleted_at
  }

  gallery_items {
    uuid id PK
    uuid gallery_id FK
    uuid media_asset_id FK
  }

  services {
    uuid id PK
    text title
    text slug
    uuid media_asset_id FK
    uuid og_media_asset_id FK
    workflow_status workflow_status
  }

  testimonials {
    uuid id PK
    text author_name
    uuid media_asset_id FK
    workflow_status workflow_status
  }

  enquiries {
    uuid id PK
    text name
    text phone
    enquiry_status status
    enquiry_source source
  }

  site_settings {
    boolean id PK
    uuid default_og_media_asset_id FK
  }

  seo_meta {
    uuid id PK
    text route_key
    uuid og_media_asset_id FK
  }

  legal_pages {
    uuid id PK
    text slug
    text title
  }

  admin_profiles {
    uuid user_id PK
    uuid avatar_media_asset_id FK
    admin_role role
  }

  audit_logs {
    uuid id PK
    text action
    text entity_type
    uuid entity_id
  }

  rate_limits {
    text key PK
    timestamptz window_start PK
  }

  homepage_sections {
    uuid id PK
    text section_key
    boolean is_enabled
  }

  %% media_assets as the central hub
  media_assets ||--o{ categories : "cover (nullable)"
  media_assets ||--o{ hero_banners : used_by
  media_assets ||--o{ projects : cover
  media_assets ||--o{ projects : "og (nullable)"
  media_assets ||--o{ project_media : used_by
  media_assets ||--o{ gallery_items : used_by
  media_assets ||--o{ services : "media (nullable)"
  media_assets ||--o{ services : "og (nullable)"
  media_assets ||--o{ testimonials : "media (nullable)"
  media_assets ||--o{ site_settings : "default_og (nullable)"
  media_assets ||--o{ seo_meta : "og (nullable)"
  media_assets ||--o{ admin_profiles : "avatar (nullable)"

  %% taxonomy & content
  categories ||--o{ projects : classifies
  categories ||--o{ galleries : "classifies (nullable)"
  projects ||--o{ project_media : has
  galleries ||--o{ gallery_items : has
```

## Notes

- `media_usage` (Task 8) is a **computed view**, not a stored table — it sums
  usage of each `media_assets` row across `project_media`, `gallery_items`,
  `hero_banners`, `projects` (cover/og), `services` (media/og), `testimonials`,
  `categories` (cover), `seo_meta` (og), `site_settings` (default_og), and
  `admin_profiles` (avatar). It is intentionally left off the ER diagram above
  since it has no independent identity or FK of its own.
- `public_projects`, `public_services`, `public_testimonials`,
  `public_site_settings` (Task 8) are `security_invoker` views over their base
  tables (column subsets respecting RLS) — also omitted as they add no new
  entities or relationships.
- Partial-unique indexes on `slug` (`projects`, `services`, `galleries`) are
  scoped to `where deleted_at is null`, enabling slug reuse after a soft
  delete; this is a constraint detail, not a relationship, so it isn't shown
  on the diagram.
- `rate_limits` has a composite primary key `(key, window_start)` and no
  foreign keys to any other table.
