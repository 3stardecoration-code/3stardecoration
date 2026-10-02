-- Migration 0006: Add category_id to services table
-- Enables services to be categorized just like projects (e.g. Wedding, Reception, etc.)

alter table services
  add column if not exists category_id uuid references categories (id) on delete set null;

create index if not exists services_category_id_idx on services (category_id);
