-- Singleton table backing the fully admin-managed /about page (hero copy,
-- story text + image, values pills, stats, and process steps). Same
-- singleton pattern as site_settings. Seeded with the copy that was
-- previously hardcoded in the About components, so nothing changes
-- visually until an admin edits it.

create table about_page_content (
  id int primary key default 1,
  hero_eyebrow text not null default 'Our story',
  hero_title text not null default 'Crafted with care.
Built to remember.',
  hero_description text not null default '3 Star Decoration was born from a belief that every celebration deserves to be extraordinary. For over a decade, we''ve turned blank venues into unforgettable experiences — one detail at a time.',
  story_eyebrow text not null default 'Who we are',
  story_title text not null default 'More than decoration — a design philosophy.',
  story_body text not null default 'Founded in Chennai, 3 Star Decoration began with a single wedding and a conviction: that every celebration, regardless of scale, deserves a considered aesthetic. We don''t apply templates. We listen, sketch, source, and build — from scratch, every time.

Over the years, our work has spanned intimate home engagements to grand ballroom receptions, baby showers to corporate galas. The through-line is always the same: a quiet, luxury aesthetic that makes the event feel inevitable — as if it could only have looked this way.

We work with florals, fabrics, lighting, and furniture — shaping the atmosphere around your story, not ours. When the day arrives, you step in and everything simply is.',
  story_image_asset_id uuid references media_assets (id) on delete set null,
  story_badge_value text not null default '10+',
  story_badge_label text not null default 'Years of craft',
  values jsonb not null default '["Bespoke design", "On-time delivery", "Zero-template approach", "Full-service setup", "Post-event cleanup"]'::jsonb,
  stats_eyebrow text not null default 'By the numbers',
  stats_title text not null default 'A decade of celebrations',
  stats jsonb not null default '[
    {"value": 10, "suffix": "+", "label": "Years of craft", "sublabel": "Founded 2014"},
    {"value": 500, "suffix": "+", "label": "Events decorated", "sublabel": "And counting"},
    {"value": 15, "suffix": "", "label": "Cities served", "sublabel": "Across Tamil Nadu"},
    {"value": 100, "suffix": "%", "label": "5-star reviews", "sublabel": "Client satisfaction"}
  ]'::jsonb,
  process_eyebrow text not null default 'How we work',
  process_title text not null default 'Simple process. Extraordinary results.',
  process_description text not null default 'From first conversation to final bow — our process is designed to be effortless for you and meticulous behind the scenes.',
  process_steps jsonb not null default '[
    {"title": "Consultation", "description": "We start with a conversation — your vision, venue, guest count, and palette. No forms, no templates. Just listening."},
    {"title": "Design & Proposal", "description": "Our team sketches a custom mood board and itemised proposal. Every element is chosen deliberately — nothing filler."},
    {"title": "Setup & Styling", "description": "On the day, our crew arrives early and works quietly. By the time guests arrive, every detail is placed and perfect."},
    {"title": "Handover & Wrap", "description": "You celebrate. We handle all post-event dismantle and cleanup — leaving the venue exactly as we found it."}
  ]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint about_page_content_singleton check (id = 1)
);

insert into about_page_content (id) values (1);

alter table about_page_content enable row level security;

create policy "public read about_page_content" on about_page_content for select using (true);
