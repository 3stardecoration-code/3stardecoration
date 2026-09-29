-- Add crafting_moments section to homepage_sections if not already present
insert into homepage_sections (section_key, is_enabled, sort_order, is_featured, config)
values (
  'crafting_moments',
  true,
  2,
  false,
  '{"eyebrow": "Since 1989", "title": "Decorating celebrations,", "title_highlight": "Creating memories."}'::jsonb
)
on conflict (section_key) do nothing;
