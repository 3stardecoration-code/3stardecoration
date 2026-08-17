-- Adds fields needed for: owner's alternative phone number, and an
-- admin-manageable site logo (points at an existing media_assets row,
-- same pattern as cover_media_asset_id / og_media_asset_id elsewhere).

alter table site_settings
  add column if not exists owner_alt_phone text,
  add column if not exists logo_media_asset_id uuid references media_assets (id) on delete set null;
